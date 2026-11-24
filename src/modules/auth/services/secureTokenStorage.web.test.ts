import {
  ANONYMOUS_SESSION_TTL_MS,
  createSecureTokenStorage as createWebTokenStorage,
  REGISTERED_SESSION_TTL_MS,
} from './secureTokenStorage.web';

function createFakeWebStorage() {
  const store = new Map<string, string>();
  return {
    store,
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
}

describe('secureTokenStorage.web (web session persistence with TTL)', () => {
  it('persists a web session across reloads without storing the plain JWT and expires after TTL', async () => {
    let currentMs = 1_700_000_000_000;
    const webStorage = createFakeWebStorage();

    const firstTabInstance = createWebTokenStorage(() => currentMs, webStorage);
    await firstTabInstance.saveToken('jwt-web-secret-token', false);

    // Verify raw token is never stored in plain text in browser storage.
    const rawStored = Array.from(webStorage.store.values()).join(' ');
    expect(rawStored).not.toContain('jwt-web-secret-token');

    // Simulate reloading the browser tab (new storage instance reading from webStorage).
    const reloadedTabInstance = createWebTokenStorage(() => currentMs, webStorage);
    await expect(reloadedTabInstance.getToken()).resolves.toBe('jwt-web-secret-token');
    await expect(reloadedTabInstance.getIsAnonymous?.()).resolves.toBe(false);

    // Advance past 7 days: session expires automatically on web too.
    currentMs += REGISTERED_SESSION_TTL_MS + 1000;
    await expect(reloadedTabInstance.getToken()).resolves.toBeNull();
    expect(webStorage.store.size).toBe(0);
  });

  it('uses a 24-hour TTL for anonymous guest sessions on web', async () => {
    let currentMs = 1_700_000_000_000;
    const webStorage = createFakeWebStorage();
    const storage = createWebTokenStorage(() => currentMs, webStorage);

    await storage.saveToken('jwt-guest-token', true);
    await expect(storage.getIsAnonymous?.()).resolves.toBe(true);

    currentMs += ANONYMOUS_SESSION_TTL_MS + 1000;
    await expect(storage.getToken()).resolves.toBeNull();
    await expect(storage.getIsAnonymous?.()).resolves.toBe(false);
  });
});
