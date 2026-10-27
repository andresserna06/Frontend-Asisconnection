import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import type { AuthRepository, TokenStorage } from '@/modules/auth/domain/AuthRepository';
import { toAuthError } from '@/modules/auth/domain/models/AuthError';
import type { LoginCredentials } from '@/modules/auth/domain/models/LoginCredentials';
import type { Session } from '@/modules/auth/domain/models/Session';
import type { User } from '@/modules/auth/domain/models/User';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

type AuthState = { status: 'loading' | 'signedOut' } | { status: 'signedIn'; session: Session };

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  sessionToken: string | null;
  // Rejects with AuthError; the session only changes on success.
  signIn(credentials: LoginCredentials): Promise<void>;
  // Always ends signed out, even if the backend call fails.
  signOut(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  repository: AuthRepository;
  storage: TokenStorage;
  children: ReactNode;
};

export function AuthProvider({ repository, storage, children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  // Restore the saved session when the app opens.
  useEffect(() => {
    let isActive = true;

    async function restoreSession() {
      try {
        const token = await storage.getToken();
        if (token === null) {
          return { status: 'signedOut' } as const;
        }
        const user = await repository.getProfile(token);
        return { status: 'signedIn', session: { token, user } } as const;
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
  }, [repository, storage]);

  async function signIn(credentials: LoginCredentials) {
    const token = await repository.login(credentials);
    const user = await repository.getProfile(token);
    await storage.saveToken(token);
    setState({ status: 'signedIn', session: { token, user } });
  }

  async function signOut() {
    if (state.status === 'signedIn') {
      await repository.logout(state.session.token).catch(() => undefined);
    }
    await storage.clearToken().catch(() => undefined);
    setState({ status: 'signedOut' });
  }

  const value: AuthContextValue = {
    status: state.status,
    user: state.status === 'signedIn' ? state.session.user : null,
    sessionToken: state.status === 'signedIn' ? state.session.token : null,
    signIn,
    signOut,
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
