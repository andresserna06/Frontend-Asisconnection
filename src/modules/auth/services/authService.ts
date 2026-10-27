import type { AuthService } from '@/modules/auth/domain/AuthService';
import { AuthError, type AuthErrorKind } from '@/modules/auth/domain/models/AuthError';
import type { User } from '@/modules/auth/domain/models/User';
import { type HttpClient, HttpError } from '@/shared/lib/http';

// Response bodies as the backend sends them (docs/api-auth.md). The backend owns their
// validation (DTOs), so the app only types them here.
type LoginResponse = { token: string };
type ProfileResponse = User;
type ValidationErrorResponse = { errores?: { email?: string; clave?: string } } | null;

// Translates a failed request into the auth domain error. `unauthorizedKind` is what a
// 401 means for the endpoint that failed.
function toAuthError(error: unknown, unauthorizedKind: AuthErrorKind): AuthError {
  if (!(error instanceof HttpError)) {
    return new AuthError('unknown');
  }
  switch (error.status) {
    case null:
      return new AuthError('network');
    case 400: {
      const errores = (error.body as ValidationErrorResponse)?.errores;
      return new AuthError('validation', { email: errores?.email, password: errores?.clave });
    }
    case 401:
      return new AuthError(unauthorizedKind);
    case 403:
      return new AuthError('forbidden');
    default:
      return new AuthError('unknown');
  }
}

export function createAuthService(client: HttpClient): AuthService {
  return {
    async login({ email, password }) {
      try {
        // The backend rejects any extra field: send exactly these two.
        const { token } = await client.request<LoginResponse>('/auth/login', {
          method: 'POST',
          body: { email, clave: password },
        });
        return token;
      } catch (error) {
        throw toAuthError(error, 'invalidCredentials');
      }
    },

    async logout(token) {
      try {
        await client.request('/auth/logout', { method: 'POST', token });
      } catch (error) {
        throw toAuthError(error, 'sessionExpired');
      }
    },

    async getProfile(token) {
      try {
        return await client.request<ProfileResponse>('/auth/perfil', { token });
      } catch (error) {
        throw toAuthError(error, 'sessionExpired');
      }
    },
  };
}
