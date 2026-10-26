import type { ReactNode } from 'react';

import { API_URL } from '@/shared/config/env';

import { AuthProvider } from './application/AuthProvider';
import { createHttpAuthRepository } from './data/httpAuthRepository';
import { createSecureTokenStorage } from './data/secureTokenStorage';

if (API_URL === null) {
  throw new Error(
    'EXPO_PUBLIC_API_URL is not set. Copy .env.example to .env and use the backend or Postman mock URL (see postman/).',
  );
}

// Composition root of the module: the only place that wires data into application.
const repository = createHttpAuthRepository(API_URL);
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
