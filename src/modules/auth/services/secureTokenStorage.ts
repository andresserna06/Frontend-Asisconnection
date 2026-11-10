import * as SecureStore from 'expo-secure-store';

import type { TokenStorage } from '@/modules/auth/domain/AuthService';

// The session token lives only in SecureStore (never AsyncStorage). Never log it.
const TOKEN_KEY = 'asisconnection.session-token';
const ANONYMOUS_SESSION_KEY = 'asisconnection.anonymous-session';

export function createSecureTokenStorage(): TokenStorage {
  return {
    getToken: () => SecureStore.getItemAsync(TOKEN_KEY),
    async getIsAnonymous() {
      return (await SecureStore.getItemAsync(ANONYMOUS_SESSION_KEY)) === 'true';
    },
    async saveToken(token, isAnonymous) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(ANONYMOUS_SESSION_KEY, String(isAnonymous));
    },
    async clearToken() {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(ANONYMOUS_SESSION_KEY);
    },
  };
}
