import { useState, type ReactNode } from 'react';

import { API_URL } from '@/shared/config/env';
import { createHttpClient } from '@/shared/lib/http';

import { AuthProvider } from './application/AuthProvider';
import { createAuthService } from './services/authService';
import { createSecureTokenStorage } from './services/secureTokenStorage';

type AppAuthProviderProps = {
  children: ReactNode;
};

export function AppAuthProvider({ children }: AppAuthProviderProps) {
  const [{ httpClient, service, storage }] = useState(() => {
    if (API_URL === null) {
      throw new Error(
        'EXPO_PUBLIC_API_URL is not set. Copy .env.example to .env and use the backend or Postman mock server URL.',
      );
    }

    const httpClient = createHttpClient(API_URL);
    return {
      httpClient,
      service: createAuthService(httpClient),
      storage: createSecureTokenStorage(),
    };
  });

  return (
    <AuthProvider service={service} storage={storage} httpClient={httpClient}>
      {children}
    </AuthProvider>
  );
}
