import type { TokenStorage } from '@/modules/auth/domain/AuthService';

// On web, expo-secure-store is unavailable. To keep the session alive across tab reloads
// for an average window (7 days registered / 24h guest) without storing the token in plain
// text or in AsyncStorage, the token is encrypted with AES-GCM (Web Crypto API) or
// obfuscated with a per-session random mask before being written to browser storage.
// Never log the token.

const WEB_STORAGE_KEY = 'asisconnection.web.session.v1';
const IDB_NAME = 'asisconnection.keystore.v1';
const IDB_STORE = 'keys';
const IDB_KEY_ID = 'session-aes-key';

export const REGISTERED_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const ANONYMOUS_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

type PersistedWebSessionEnvelope = {
  mode: 'aes-gcm' | 'masked';
  ciphertext: string;
  iv: string;
  isAnonymous: boolean;
  expiresAt: number;
};

type WebStorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

function getBrowserStorage(): WebStorageLike | null {
  try {
    if (
      typeof globalThis !== 'undefined' &&
      'localStorage' in globalThis &&
      globalThis.localStorage
    ) {
      return globalThis.localStorage;
    }
  } catch {
    // Private browsing or sandboxed iframe without localStorage access.
  }
  return null;
}

function computeExpiresAt(isAnonymous: boolean, nowMs: number): number {
  return nowMs + (isAnonymous ? ANONYMOUS_SESSION_TTL_MS : REGISTERED_SESSION_TTL_MS);
}

function bytesToHex(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) {
    out += bytes[i].toString(16).padStart(2, '0');
  }
  return out;
}

function hexToBytes(encoded: string): Uint8Array {
  const clean = encoded.length % 2 === 0 ? encoded : `0${encoded}`;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = Number.parseInt(clean.slice(i, i + 2), 16);
  }
  return bytes;
}

function randomBytes(length: number): Uint8Array {
  const out = new Uint8Array(length);
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(out);
    return out;
  }
  for (let i = 0; i < length; i += 1) {
    out[i] = Math.floor(Math.random() * 256);
  }
  return out;
}

function maskToken(token: string): { ciphertext: string; iv: string } {
  const encoder = new TextEncoder();
  const payload = encoder.encode(token);
  const mask = randomBytes(payload.length || 1);
  const masked = new Uint8Array(payload.length);
  for (let i = 0; i < payload.length; i += 1) {
    masked[i] = payload[i] ^ mask[i % mask.length];
  }
  return {
    ciphertext: bytesToHex(masked),
    iv: bytesToHex(mask),
  };
}

function unmaskToken(ciphertext: string, iv: string): string {
  const masked = hexToBytes(ciphertext);
  const mask = hexToBytes(iv);
  const unmasked = new Uint8Array(masked.length);
  for (let i = 0; i < masked.length; i += 1) {
    unmasked[i] = masked[i] ^ mask[i % mask.length];
  }
  return new TextDecoder().decode(unmasked);
}

function openKeyDatabase(): Promise<IDBDatabase | null> {
  if (typeof globalThis.indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = globalThis.indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function getOrCreateAesKey(): Promise<CryptoKey | null> {
  if (typeof globalThis.crypto?.subtle?.generateKey !== 'function') {
    return null;
  }
  const db = await openKeyDatabase();
  if (db) {
    const existing = await new Promise<CryptoKey | null>((resolve) => {
      try {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const req = tx.objectStore(IDB_STORE).get(IDB_KEY_ID);
        req.onsuccess = () => resolve((req.result as CryptoKey | undefined) ?? null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
    if (existing) {
      db.close();
      return existing;
    }
  }

  try {
    const key = await globalThis.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
    if (db) {
      await new Promise<void>((resolve) => {
        try {
          const tx = db.transaction(IDB_STORE, 'readwrite');
          tx.objectStore(IDB_STORE).put(key, IDB_KEY_ID);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
      db.close();
      return key;
    }
    return null;
  } catch {
    db?.close();
    return null;
  }
}

async function clearAesKey(): Promise<void> {
  const db = await openKeyDatabase();
  if (!db) {
    return;
  }
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).delete(IDB_KEY_ID);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
  db.close();
}

export function createSecureTokenStorage(
  now: () => number = Date.now,
  storageOverride?: WebStorageLike | null,
): TokenStorage {
  let memoryToken: string | null = null;
  let memoryIsAnonymous = false;
  let memoryExpiresAt: number | null = null;

  function resolveStorage(): WebStorageLike | null {
    return storageOverride !== undefined ? storageOverride : getBrowserStorage();
  }

  function readEnvelope(webStorage: WebStorageLike): PersistedWebSessionEnvelope | null {
    try {
      const raw = webStorage.getItem(WEB_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as Partial<PersistedWebSessionEnvelope>;
      if (
        (parsed.mode !== 'aes-gcm' && parsed.mode !== 'masked') ||
        typeof parsed.ciphertext !== 'string' ||
        typeof parsed.iv !== 'string' ||
        typeof parsed.isAnonymous !== 'boolean' ||
        typeof parsed.expiresAt !== 'number'
      ) {
        return null;
      }
      return parsed as PersistedWebSessionEnvelope;
    } catch {
      return null;
    }
  }

  async function clearToken(): Promise<void> {
    memoryToken = null;
    memoryIsAnonymous = false;
    memoryExpiresAt = null;
    const webStorage = resolveStorage();
    try {
      webStorage?.removeItem(WEB_STORAGE_KEY);
    } catch {
      // Ignore storage removal errors.
    }
    await clearAesKey();
  }

  return {
    async getToken() {
      const currentMs = now();
      const webStorage = resolveStorage();

      if (webStorage) {
        const envelope = readEnvelope(webStorage);
        if (envelope) {
          if (currentMs > envelope.expiresAt) {
            await clearToken();
            return null;
          }
          try {
            let decrypted: string | null = null;
            if (envelope.mode === 'aes-gcm') {
              const aesKey = await getOrCreateAesKey();
              if (aesKey && typeof globalThis.crypto?.subtle?.decrypt === 'function') {
                const ivBytes = hexToBytes(envelope.iv);
                const cipherBytes = hexToBytes(envelope.ciphertext);
                const plainBuffer = await globalThis.crypto.subtle.decrypt(
                  { name: 'AES-GCM', iv: ivBytes as BufferSource },
                  aesKey,
                  cipherBytes as BufferSource,
                );
                decrypted = new TextDecoder().decode(plainBuffer);
              }
            } else {
              decrypted = unmaskToken(envelope.ciphertext, envelope.iv);
            }

            if (decrypted) {
              const refreshed: PersistedWebSessionEnvelope = {
                ...envelope,
                expiresAt: computeExpiresAt(envelope.isAnonymous, currentMs),
              };
              try {
                webStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(refreshed));
              } catch {
                // Ignore quota errors on sliding expiration update.
              }
              memoryToken = decrypted;
              memoryIsAnonymous = envelope.isAnonymous;
              memoryExpiresAt = refreshed.expiresAt;
              return decrypted;
            }
          } catch {
            await clearToken();
            return null;
          }
        }
      }

      if (memoryToken !== null) {
        if (memoryExpiresAt !== null && currentMs > memoryExpiresAt) {
          await clearToken();
          return null;
        }
        memoryExpiresAt = computeExpiresAt(memoryIsAnonymous, currentMs);
        return memoryToken;
      }

      return null;
    },

    async getIsAnonymous() {
      const webStorage = resolveStorage();
      if (webStorage) {
        const envelope = readEnvelope(webStorage);
        if (envelope) {
          if (now() > envelope.expiresAt) {
            await clearToken();
            return false;
          }
          return envelope.isAnonymous;
        }
      }
      return memoryIsAnonymous;
    },

    async saveToken(newToken, newIsAnonymous) {
      const currentMs = now();
      const expiresAt = computeExpiresAt(newIsAnonymous, currentMs);
      memoryToken = newToken;
      memoryIsAnonymous = newIsAnonymous;
      memoryExpiresAt = expiresAt;

      const webStorage = resolveStorage();
      if (!webStorage) {
        return;
      }

      let envelope: PersistedWebSessionEnvelope;
      const aesKey = await getOrCreateAesKey();
      if (aesKey && typeof globalThis.crypto?.subtle?.encrypt === 'function') {
        const ivBytes = randomBytes(12);
        const encoded = new TextEncoder().encode(newToken);
        const cipherBuffer = await globalThis.crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: ivBytes as BufferSource },
          aesKey,
          encoded as BufferSource,
        );
        envelope = {
          mode: 'aes-gcm',
          ciphertext: bytesToHex(new Uint8Array(cipherBuffer)),
          iv: bytesToHex(ivBytes),
          isAnonymous: newIsAnonymous,
          expiresAt,
        };
      } else {
        const masked = maskToken(newToken);
        envelope = {
          mode: 'masked',
          ciphertext: masked.ciphertext,
          iv: masked.iv,
          isAnonymous: newIsAnonymous,
          expiresAt,
        };
      }

      try {
        webStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(envelope));
      } catch {
        // Fallback to in-memory session when storage is unavailable.
      }
    },

    clearToken,
  };
}
