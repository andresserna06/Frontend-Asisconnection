import type { ReactNode } from 'react';

import { API_URL } from '@/shared/config/env';
import { createHttpClient } from '@/shared/lib/http';

import { AuthProvider } from './application/AuthProvider';
import { createAuthService } from './services/authService';
import { createSecureTokenStorage } from './services/secureTokenStorage';

const httpClient = API_URL === null ? null : createHttpClient(API_URL);
const service = httpClient === null ? null : createAuthService(httpClient);
const storage = createSecureTokenStorage();

type AppAuthProviderProps = {
  children: ReactNode;
};

export function AppAuthProvider({ children }: AppAuthProviderProps) {
  if (httpClient === null || service === null) {
    throw new Error(
      'EXPO_PUBLIC_API_URL is not set. Copy .env.example to .env and use the backend or Postman mock server URL.',
    );
  }

  return (
    <AuthProvider service={service} storage={storage} httpClient={httpClient}>
      {children}
    </AuthProvider>
  );
}
