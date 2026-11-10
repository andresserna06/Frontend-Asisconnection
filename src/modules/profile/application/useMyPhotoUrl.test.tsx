import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useAuth } from '@/modules/auth';
import { createFakeProfileService, TEST_PROFILE } from '@/modules/profile/testUtils';
import { useProfileService } from '@/modules/profile/useProfileService';
import { createHttpClient } from '@/shared/lib/http';

import { useMyPhotoUrl, useRefreshMyPhotoUrl } from './useMyPhotoUrl';

jest.mock('@/modules/auth', () => ({ useAuth: jest.fn() }));
jest.mock('@/modules/profile/useProfileService', () => ({ useProfileService: jest.fn() }));

function configure(isAnonymous: boolean, photoUrls: (string | null)[]) {
  const getMyProfile = jest.fn();
  for (const photoUrl of photoUrls) {
    getMyProfile.mockResolvedValueOnce({ ...TEST_PROFILE, photoUrl });
  }
  jest.mocked(useProfileService).mockReturnValue(createFakeProfileService({ getMyProfile }));
  jest.mocked(useAuth).mockReturnValue({
    status: 'signedIn',
    user: { username: 'persona', roles: ['ACUDIENTE'] },
    isAnonymous,
    signIn: async () => undefined,
    signInAnonymous: async () => undefined,
    registerAccount: async () => undefined,
    signOut: async () => undefined,
    authorizedClient: createHttpClient('https://api.example.test'),
  });
  return getMyProfile;
}

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useMyPhotoUrl', () => {
  it('returns the photo and updates it after a refresh', async () => {
    configure(false, ['https://example.test/old.jpg', 'https://example.test/new.jpg']);

    const { result } = await renderHook(
      () => ({ photoUrl: useMyPhotoUrl(), refresh: useRefreshMyPhotoUrl() }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.photoUrl).toBe('https://example.test/old.jpg'));
    await act(async () => result.current.refresh());
    await waitFor(() => expect(result.current.photoUrl).toBe('https://example.test/new.jpg'));
  });

  it('does not query the profile of a guest', async () => {
    const getMyProfile = configure(true, []);

    const { result } = await renderHook(() => useMyPhotoUrl(), { wrapper: createWrapper() });

    expect(result.current).toBeNull();
    expect(getMyProfile).not.toHaveBeenCalled();
  });
});
