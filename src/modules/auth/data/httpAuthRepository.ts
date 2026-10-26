import type { AuthRepository } from '@/modules/auth/domain/AuthRepository';
import { AuthError, type AuthErrorKind } from '@/modules/auth/domain/models/AuthError';

import { mapFieldErrors, mapLoginResponse, mapProfileResponse } from './authMappers';

// Render may take a while to wake up on the first request.
const REQUEST_TIMEOUT_MS = 30_000;

type RequestOptions = {
  method: 'GET' | 'POST';
  token?: string;
  body?: Record<string, string>;
  // What a 401 means for this endpoint.
  unauthorizedKind: AuthErrorKind;
};

export function createHttpAuthRepository(baseUrl: string): AuthRepository {
  async function request(path: string, options: RequestOptions): Promise<unknown> {
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
      return json;
    }
    switch (response.status) {
      case 400:
        throw new AuthError('validation', mapFieldErrors(json));
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
      const json = await request('/auth/login', {
        method: 'POST',
        body: { email, clave: password },
        unauthorizedKind: 'invalidCredentials',
      });
      return mapLoginResponse(json);
    },

    async logout(token) {
      await request('/auth/logout', { method: 'POST', token, unauthorizedKind: 'sessionExpired' });
    },

    async getProfile(token) {
      const json = await request('/auth/perfil', {
        method: 'GET',
        token,
        unauthorizedKind: 'sessionExpired',
      });
      return mapProfileResponse(json);
    },
  };
}
