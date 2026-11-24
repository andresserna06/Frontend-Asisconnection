import * as SecureStore from 'expo-secure-store';

import {
  createSecureTokenStorage as createNativeTokenStorage,
  REGISTERED_SESSION_TTL_MS,
} from './secureTokenStorage';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('secureTokenStorage (mobile session persistence with TTL)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('persists and restores a mobile session in SecureStore within the 7-day window and expires after TTL', async () => {
    const secureMap = new Map<string, string>();
    jest
      .mocked(SecureStore.getItemAsync)
      .mockImplementation(async (key) => secureMap.get(key) ?? null);
    jest.mocked(SecureStore.setItemAsync).mockImplementation(async (key, value) => {
      secureMap.set(key, value);
    });
    jest.mocked(SecureStore.deleteItemAsync).mockImplementation(async (key) => {
      secureMap.delete(key);
    });

    let currentMs = 1_700_000_000_000;
    const storage = createNativeTokenStorage(() => currentMs);

    await storage.saveToken('jwt-mobile-secret', false);
    await expect(storage.getToken()).resolves.toBe('jwt-mobile-secret');
    await expect(storage.getIsAnonymous?.()).resolves.toBe(false);

    // Advance 3 days: still active and sliding window refreshes expiration.
    currentMs += 3 * 24 * 60 * 60 * 1000;
    await expect(storage.getToken()).resolves.toBe('jwt-mobile-secret');

    // Advance beyond 7 days without activity: session expires and clears SecureStore.
    currentMs += REGISTERED_SESSION_TTL_MS + 1000;
    await expect(storage.getToken()).resolves.toBeNull();
    expect(secureMap.size).toBe(0);
  });
});
