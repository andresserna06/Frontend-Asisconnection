import type { ReactNode } from 'react';

import { AuthProvider } from '@/modules/auth/application/AuthProvider';
import type { AuthService, TokenStorage } from '@/modules/auth/domain/AuthService';
import type { User } from '@/modules/auth/domain/models/User';
import { createHttpClient, type HttpClient } from '@/shared/lib/http';

// Test doubles for the auth module. Only imported from *.test.ts(x) files.

export const TEST_USER: User = {
  username: 'test.user',
  email: 'test@prueba.com',
  roles: ['ACUDIENTE'],
};

export const TEST_TOKEN = 'test-token';

export function createFakeAuthService(overrides: Partial<AuthService> = {}) {
  return {
    login: jest.fn<Promise<string>, Parameters<AuthService['login']>>(async () => TEST_TOKEN),
    logout: jest.fn<Promise<void>, [string]>(async () => undefined),
    getProfile: jest.fn<Promise<User>, [string]>(async () => TEST_USER),
    ...overrides,
  };
}

export function createMemoryStorage(initialToken: string | null = null) {
  let token = initialToken;
  return {
    getToken: jest.fn(async () => token),
    saveToken: jest.fn(async (value: string) => {
      token = value;
    }),
    clearToken: jest.fn(async () => {
      token = null;
    }),
    peek: () => token,
  } satisfies TokenStorage & { peek: () => string | null };
}

// Never reached unless a test mocks fetch (jest.spyOn(globalThis, 'fetch')).
export const TEST_BASE_URL = 'https://api.example.test';

export function createAuthWrapper(
  service: AuthService,
  storage: TokenStorage,
  httpClient: HttpClient = createHttpClient(TEST_BASE_URL),
) {
  return function AuthWrapper({ children }: { children: ReactNode }) {
    return (
      <AuthProvider service={service} storage={storage} httpClient={httpClient}>
        {children}
      </AuthProvider>
    );
  };
}
