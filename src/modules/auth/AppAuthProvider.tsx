import type { ReactNode } from 'react';

import { API_URL } from '@/shared/config/env';

import { AuthProvider } from './application/AuthProvider';
import { createHttpAuthRepository } from './data/httpAuthRepository';
import { createMockAuthRepository } from './data/mockAuthRepository';
import { createSecureTokenStorage } from './data/secureTokenStorage';

// Composition root of the module: the only place that wires data into application.
// Uses the real backend when EXPO_PUBLIC_API_URL is set, the mock otherwise.
const repository = API_URL ? createHttpAuthRepository(API_URL) : createMockAuthRepository();
const storage = createSecureTokenStorage();

type AppAuthProviderProps = {
  children: ReactNode;
};

export function AppAuthProvider({ children }: AppAuthProviderProps) {
  return (
    <AuthProvider repository={repository} storage={storage}>
      {children}
    </AuthProvider>
  );
}
