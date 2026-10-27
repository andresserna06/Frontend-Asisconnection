import type { ReactNode } from 'react';

import { API_URL } from '@/shared/config/env';

import { AuthProvider } from './application/AuthProvider';
import { createHttpAuthRepository } from './data/httpAuthRepository';
import { createSecureTokenStorage } from './data/secureTokenStorage';

// Composition root of the module: the only place that wires data into application.
const repository = API_URL === null ? null : createHttpAuthRepository(API_URL);
const storage = createSecureTokenStorage();

type AppAuthProviderProps = {
  children: ReactNode;
};

export function AppAuthProvider({ children }: AppAuthProviderProps) {
  if (repository === null) {
    throw new Error(
      'EXPO_PUBLIC_API_URL is not set. Copy .env.example to .env and use the backend or Postman mock server URL.',
    );
  }

  return (
    <AuthProvider repository={repository} storage={storage}>
      {children}
    </AuthProvider>
  );
}
