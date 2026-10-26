import type { AuthRepository } from '@/modules/auth/domain/AuthRepository';
import { AuthError, type AuthErrorKind } from '@/modules/auth/domain/models/AuthError';
import type { User } from '@/modules/auth/domain/models/User';

// Render may take a while to wake up on the first request.
const REQUEST_TIMEOUT_MS = 30_000;

// Response bodies as the backend sends them (docs/api-auth.md). The backend owns their
// validation (DTOs), so the app only types them here.
type LoginResponse = { token: string };
type ProfileResponse = User;
type ValidationErrorResponse = { errores?: { email?: string; clave?: string } } | null;

type RequestOptions = {
  method: 'GET' | 'POST';
  token?: string;
  body?: Record<string, string>;
  // What a 401 means for this endpoint.
  unauthorizedKind: AuthErrorKind;
};

export function createHttpAuthRepository(baseUrl: string): AuthRepository {
  async function request<T>(path: string, options: RequestOptions): Promise<T> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }
    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        method: options.method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });
    } catch {
      throw new AuthError('network');
    } finally {
      clearTimeout(timeout);
    }

    const json: unknown = await response.json().catch(() => null);
    if (response.ok) {
      return json as T;
    }
    switch (response.status) {
      case 400: {
        const errores = (json as ValidationErrorResponse)?.errores;
        throw new AuthError('validation', { email: errores?.email, password: errores?.clave });
      }
      case 401:
        throw new AuthError(options.unauthorizedKind);
      case 403:
        throw new AuthError('forbidden');
      default:
        throw new AuthError('unknown');
    }
  }

  return {
    async login({ email, password }) {
      // The backend rejects any extra field: send exactly these two.
      const { token } = await request<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { email, clave: password },
        unauthorizedKind: 'invalidCredentials',
      });
      return token;
    },

    async logout(token) {
      await request('/auth/logout', { method: 'POST', token, unauthorizedKind: 'sessionExpired' });
    },

    async getProfile(token) {
      return request<ProfileResponse>('/auth/perfil', {
        method: 'GET',
        token,
        unauthorizedKind: 'sessionExpired',
      });
    },
  };
}
