import type { AuthRepository } from '@/modules/auth/domain/AuthRepository';
import { AuthError } from '@/modules/auth/domain/models/AuthError';

import { MOCK_ACCOUNT, MOCK_TOKEN } from './mocks';

const DEFAULT_DELAY_MS = 800;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Stand-in for the backend while EXPO_PUBLIC_API_URL is not set. Same contract as HTTP.
export function createMockAuthRepository(delayMs = DEFAULT_DELAY_MS): AuthRepository {
  return {
    async login({ email, password }) {
      await wait(delayMs);
      const isValid =
        email.trim().toLowerCase() === MOCK_ACCOUNT.user.email &&
        password === MOCK_ACCOUNT.password;
      if (!isValid) {
        throw new AuthError('invalidCredentials');
      }
      return MOCK_TOKEN;
    },

    async logout() {
      await wait(delayMs);
    },

    async getProfile(token) {
      await wait(delayMs);
      if (token !== MOCK_TOKEN) {
        throw new AuthError('sessionExpired');
      }
      return MOCK_ACCOUNT.user;
    },
  };
}
