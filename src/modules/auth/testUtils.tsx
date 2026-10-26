import type { ReactNode } from 'react';

import { AuthProvider } from '@/modules/auth/application/AuthProvider';
import type { AuthRepository, TokenStorage } from '@/modules/auth/domain/AuthRepository';
import type { User } from '@/modules/auth/domain/models/User';

// Test doubles for the auth module. Only imported from *.test.ts(x) files.

export const TEST_USER: User = {
  username: 'test.user',
  email: 'test@prueba.com',
  roles: ['ACUDIENTE'],
};

export const TEST_TOKEN = 'test-token';

export function createFakeRepository(overrides: Partial<AuthRepository> = {}) {
  return {
    login: jest.fn<Promise<string>, Parameters<AuthRepository['login']>>(async () => TEST_TOKEN),
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

export function createAuthWrapper(repository: AuthRepository, storage: TokenStorage) {
  return function AuthWrapper({ children }: { children: ReactNode }) {
    return (
      <AuthProvider repository={repository} storage={storage}>
        {children}
      </AuthProvider>
    );
  };
}
