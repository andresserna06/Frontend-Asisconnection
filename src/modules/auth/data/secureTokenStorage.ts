import * as SecureStore from 'expo-secure-store';

import type { TokenStorage } from '@/modules/auth/domain/AuthRepository';

// The session token lives only in SecureStore (never AsyncStorage). Never log it.
const TOKEN_KEY = 'asisconnection.session-token';

export function createSecureTokenStorage(): TokenStorage {
  return {
    getToken: () => SecureStore.getItemAsync(TOKEN_KEY),
    saveToken: (token) => SecureStore.setItemAsync(TOKEN_KEY, token),
    clearToken: () => SecureStore.deleteItemAsync(TOKEN_KEY),
  };
}
