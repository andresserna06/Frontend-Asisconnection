import * as SecureStore from 'expo-secure-store';

import type { TokenStorage } from '@/modules/auth/domain/AuthService';

// The session token lives only in SecureStore (never AsyncStorage). Never log it.
const TOKEN_KEY = 'asisconnection.session-token';
const ANONYMOUS_SESSION_KEY = 'asisconnection.anonymous-session';
const EXPIRES_AT_KEY = 'asisconnection.session-expires-at';

// Average session duration: 7 days for registered users, 24 hours for guest sessions.
export const REGISTERED_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const ANONYMOUS_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function computeExpiresAt(isAnonymous: boolean, nowMs = Date.now()): number {
  return nowMs + (isAnonymous ? ANONYMOUS_SESSION_TTL_MS : REGISTERED_SESSION_TTL_MS);
}

export function createSecureTokenStorage(now: () => number = Date.now): TokenStorage {
  async function clearToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(ANONYMOUS_SESSION_KEY);
    await SecureStore.deleteItemAsync(EXPIRES_AT_KEY);
  }

  return {
    async getToken() {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token === null) {
        return null;
      }

      const rawExpiresAt = await SecureStore.getItemAsync(EXPIRES_AT_KEY);
      if (rawExpiresAt !== null) {
        const expiresAt = Number(rawExpiresAt);
        if (Number.isFinite(expiresAt) && now() > expiresAt) {
          await clearToken();
          return null;
        }
      }

      const isAnonymous = (await SecureStore.getItemAsync(ANONYMOUS_SESSION_KEY)) === 'true';
      await SecureStore.setItemAsync(
        EXPIRES_AT_KEY,
        String(computeExpiresAt(isAnonymous, now())),
      ).catch(() => undefined);

      return token;
    },

    async getIsAnonymous() {
      return (await SecureStore.getItemAsync(ANONYMOUS_SESSION_KEY)) === 'true';
    },

    async saveToken(token, isAnonymous) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(ANONYMOUS_SESSION_KEY, String(isAnonymous));
      await SecureStore.setItemAsync(EXPIRES_AT_KEY, String(computeExpiresAt(isAnonymous, now())));
    },

    clearToken,
  };
}
