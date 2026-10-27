import type { TokenStorage } from '@/modules/auth/domain/AuthService';

// expo-secure-store has no web implementation. On web the token lives only in memory
// (never localStorage), so the session ends when the tab is reloaded. Never log it.
export function createSecureTokenStorage(): TokenStorage {
  let token: string | null = null;
  return {
    getToken: async () => token,
    saveToken: async (newToken) => {
      token = newToken;
    },
    clearToken: async () => {
      token = null;
    },
  };
}
