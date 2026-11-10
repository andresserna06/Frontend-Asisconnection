import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type {
  AnonymousCredentials,
  AuthService,
  RegisterCredentials,
  TokenStorage,
} from '@/modules/auth/domain/AuthService';
import { AuthError, toAuthError } from '@/modules/auth/domain/models/AuthError';
import type { LoginCredentials } from '@/modules/auth/domain/models/LoginCredentials';
import type { Session } from '@/modules/auth/domain/models/Session';
import type { User } from '@/modules/auth/domain/models/User';
import { type HttpClient, HttpError } from '@/shared/lib/http';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

type AuthState = { status: 'loading' | 'signedOut' } | { status: 'signedIn'; session: Session };

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  isAnonymous: boolean;
  // Rejects with AuthError; the session only changes on success.
  signIn(credentials: LoginCredentials): Promise<void>;
  signInAnonymous?(credentials?: Partial<AnonymousCredentials>): Promise<void>;
  registerAccount?(credentials: RegisterCredentials): Promise<void>;
  register?(credentials: RegisterCredentials): Promise<void>;
  // Always ends signed out, even if the backend call fails.
  signOut(): Promise<void>;
  // HTTP client for the other modules' services: sends the session token and signs out
  // on a 401. The token itself never leaves this module.
  authorizedClient: HttpClient;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  service: AuthService;
  storage: TokenStorage;
  // Base client (no token) the authorized client is built on.
  httpClient: HttpClient;
  children: ReactNode;
};

export function AuthProvider({ service, storage, httpClient, children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({ status: 'loading' });
  const token = state.status === 'signedIn' ? state.session.token : null;

  // Restore the saved session when the app opens.
  useEffect(() => {
    let isActive = true;

    async function restoreSession() {
      try {
        const savedToken = await storage.getToken();
        if (savedToken === null) {
          return { status: 'signedOut' } as const;
        }
        const [user, isAnonymous] = await Promise.all([
          service.getProfile(savedToken),
          storage.getIsAnonymous ? storage.getIsAnonymous() : Promise.resolve(false),
        ]);
        return {
          status: 'signedIn',
          session: { token: savedToken, user, isAnonymous },
        } as const;
      } catch (error) {
        // Only an expired session invalidates the token; offline keeps it for the next launch.
        if (toAuthError(error).kind === 'sessionExpired') {
          await storage.clearToken().catch(() => undefined);
        }
        return { status: 'signedOut' } as const;
      }
    }

    restoreSession().then((restored) => {
      if (isActive) {
        setState(restored);
      }
    });
    return () => {
      isActive = false;
    };
  }, [service, storage]);

  const signIn = useCallback(
    async (credentials: LoginCredentials) => {
      const session = await service.login(credentials);
      await storage.saveToken(session.token, session.isAnonymous);
      setState({ status: 'signedIn', session });
    },
    [service, storage],
  );

  const signInAnonymous = useCallback(
    async (credentials?: Partial<AnonymousCredentials>) => {
      if (!service.loginAnonymous) {
        throw new AuthError('unknown');
      }
      const session = await service.loginAnonymous({
        acceptConsent: credentials?.acceptConsent ?? true,
        nickname: credentials?.nickname,
        roleTag: credentials?.roleTag,
      });
      await storage.saveToken(session.token, session.isAnonymous ?? true);
      setState({
        status: 'signedIn',
        session: { ...session, isAnonymous: session.isAnonymous ?? true },
      });
    },
    [service, storage],
  );

  const registerAccount = useCallback(
    async (credentials: RegisterCredentials) => {
      if (!service.register) {
        throw new AuthError('unknown');
      }
      const session = await service.register(credentials);
      await storage.saveToken(session.token, session.isAnonymous ?? false);
      setState({ status: 'signedIn', session });
    },
    [service, storage],
  );

  // The device token is local (no logout endpoint): signing out only forgets it.
  const signOut = useCallback(async () => {
    await storage.clearToken().catch(() => undefined);
    setState({ status: 'signedOut' });
  }, [storage]);

  // Stable while the session does not change, so services built on it can be memoized.
  const authorizedClient = useMemo<HttpClient>(
    () => ({
      async request<T>(path: string, options: Parameters<HttpClient['request']>[1] = {}) {
        try {
          return await httpClient.request<T>(path, { ...options, token: token ?? undefined });
        } catch (error) {
          if (
            error instanceof HttpError &&
            error.status === 401 &&
            token !== null &&
            options.signOutOnUnauthorized !== false
          ) {
            await signOut();
          }
          throw error;
        }
      },
      async uploadFile<T>(path: string, formData: FormData) {
        if (!httpClient.uploadFile) {
          throw new HttpError(null);
        }
        try {
          return await httpClient.uploadFile<T>(path, formData, token ?? undefined);
        } catch (error) {
          if (error instanceof HttpError && error.status === 401 && token !== null) {
            await signOut();
          }
          throw error;
        }
      },
    }),
    [httpClient, token, signOut],
  );

  const value: AuthContextValue = {
    status: state.status,
    user: state.status === 'signedIn' ? state.session.user : null,
    isAnonymous: state.status === 'signedIn' && Boolean(state.session.isAnonymous),
    signIn,
    signInAnonymous,
    registerAccount,
    register: registerAccount,
    signOut,
    authorizedClient,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}

// What other modules use to build their services (see AGENTS.md, section 3).
export function useAuthorizedHttpClient(): HttpClient {
  return useAuth().authorizedClient;
}
