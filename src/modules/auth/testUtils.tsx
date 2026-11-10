import type { ReactNode } from 'react';

import { AuthProvider } from '@/modules/auth/application/AuthProvider';
import type { AuthService, TokenStorage } from '@/modules/auth/domain/AuthService';
import type { Session } from '@/modules/auth/domain/models/Session';
import type { User } from '@/modules/auth/domain/models/User';
import { createHttpClient, type HttpClient } from '@/shared/lib/http';

// Test doubles for the auth module. Only imported from *.test.ts(x) files.

export const TEST_USER: User = {
  username: 'test.user',
  roles: ['ACUDIENTE'],
};

export const TEST_TOKEN = 'test-token';

export function createFakeAuthService(overrides: Partial<AuthService> = {}) {
  return {
    login: jest.fn<Promise<Session>, Parameters<AuthService['login']>>(async () => ({
      token: TEST_TOKEN,
      user: TEST_USER,
      isAnonymous: false,
    })),
    loginAnonymous: jest.fn<
      Promise<Session>,
      Parameters<NonNullable<AuthService['loginAnonymous']>>
    >(async () => ({
      token: 'guest-token',
      user: { username: 'Invitado', roles: ['BENEFICIARIO'] },
      isAnonymous: true,
    })),
    register: jest.fn<Promise<Session>, Parameters<NonNullable<AuthService['register']>>>(
      async () => ({
        token: 'registered-token',
        user: TEST_USER,
        isAnonymous: false,
      }),
    ),
    getProfile: jest.fn<Promise<User>, [string]>(async () => TEST_USER),
    ...overrides,
  };
}

export function createMemoryStorage(
  initialToken: string | null = null,
  initialIsAnonymous = false,
) {
  let token = initialToken;
  let isAnonymous = initialIsAnonymous;
  return {
    getToken: jest.fn(async () => token),
    getIsAnonymous: jest.fn(async () => isAnonymous),
    saveToken: jest.fn(async (value: string, anonymous: boolean) => {
      token = value;
      isAnonymous = anonymous;
    }),
    clearToken: jest.fn(async () => {
      token = null;
      isAnonymous = false;
    }),
    peek: () => token,
    isAnonymous: () => isAnonymous,
  } satisfies TokenStorage & { peek: () => string | null; isAnonymous: () => boolean };
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
