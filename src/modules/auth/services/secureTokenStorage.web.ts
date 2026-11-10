import type { TokenStorage } from '@/modules/auth/domain/AuthService';

// expo-secure-store has no web implementation. On web the token lives only in memory
// (never localStorage), so the session ends when the tab is reloaded. Never log it.
export function createSecureTokenStorage(): TokenStorage {
  let token: string | null = null;
  let isAnonymous = false;
  return {
    getToken: async () => token,
    getIsAnonymous: async () => isAnonymous,
    saveToken: async (newToken, newIsAnonymous) => {
      token = newToken;
      isAnonymous = newIsAnonymous;
    },
    clearToken: async () => {
      token = null;
      isAnonymous = false;
    },
  };
}
