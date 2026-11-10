import { renderHook, waitFor } from '@testing-library/react-native';

import type { PublicProfileService } from '@/modules/profile/domain/PublicProfileService';
import type { PublicProfile } from '@/modules/profile/domain/models/PublicProfile';
import { PublicProfileError } from '@/modules/profile/domain/models/PublicProfileError';

import { usePublicProfile } from './usePublicProfile';

const TEST_PUBLIC_PROFILE: PublicProfile = {
  id: 'actor-1',
  fullName: 'Persona Prueba',
  roles: ['ACUDIENTE'],
  photoUrl: null,
  shortBio: null,
  birthDate: null,
  city: null,
  postCount: 0,
  followerCount: 0,
  followingCount: 0,
};

describe('usePublicProfile', () => {
  it('loads a public profile by actor ID', async () => {
    const service: PublicProfileService = {
      getPublicProfile: jest.fn(async () => TEST_PUBLIC_PROFILE),
      getConnectionStatus: jest.fn(async () => 'notFollowing'),
      requestFollow: jest.fn(async () => 'pending'),
    };
    const { result } = await renderHook(() => usePublicProfile(service, 'actor-1'));

    await waitFor(() => {
      expect(result.current.profile).toEqual({ status: 'success', data: TEST_PUBLIC_PROFILE });
    });
    expect(service.getPublicProfile).toHaveBeenCalledWith('actor-1');
  });

  it('exposes service errors for the screen to render', async () => {
    const service: PublicProfileService = {
      getPublicProfile: jest.fn(async () => {
        throw new PublicProfileError('notFound');
      }),
      getConnectionStatus: jest.fn(async () => 'notFollowing'),
      requestFollow: jest.fn(async () => 'pending'),
    };
    const { result } = await renderHook(() => usePublicProfile(service, 'missing'));

    await waitFor(() => {
      expect(result.current.profile).toMatchObject({
        status: 'error',
        error: { kind: 'notFound' },
      });
    });
  });
});
