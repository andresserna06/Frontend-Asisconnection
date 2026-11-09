import { act, renderHook, waitFor } from '@testing-library/react-native';

import { ProfileError } from '@/modules/profile/domain/models/ProfileError';
import type { ProfileService } from '@/modules/profile/domain/ProfileService';

import { usePublicProfile } from './usePublicProfile';

const SAMPLE_PUBLIC_PROFILE = {
  id: 'actor-2',
  fullName: 'Carlos Ruiz',
  roles: ['VOLUNTARIO' as const],
  photoUrl: null,
  email: 'Sin agregar',
  birthDate: null,
  city: 'Manizales',
  memberSince: '2026-03-01T00:00:00.000Z',
  postCount: 4,
  followerCount: 10,
  followingCount: 6,
  savedCount: 0,
};

describe('usePublicProfile', () => {
  it('loads the public profile and executes followActor recording the resulting connection status', async () => {
    const service: ProfileService = {
      getMyProfile: jest.fn(),
      getMyPosts: jest.fn(),
      getMySavedPosts: jest.fn(),
      getPublicProfile: jest.fn().mockResolvedValue(SAMPLE_PUBLIC_PROFILE),
      followActor: jest.fn().mockResolvedValue({ id: 'conn-1', status: 'ACCEPTED' }),
    };

    const { result } = await renderHook(() => usePublicProfile(service, 'actor-2'));

    await waitFor(() => {
      expect(result.current.profile.status).toBe('success');
    });

    if (result.current.profile.status === 'success') {
      expect(result.current.profile.data.fullName).toBe('Carlos Ruiz');
    }

    await act(async () => {
      await result.current.follow();
    });

    expect(result.current.connection).toEqual({ id: 'conn-1', status: 'ACCEPTED' });
    expect(result.current.followError).toBeNull();
  });

  it('captures followError without throwing when followActor rejects', async () => {
    const service: ProfileService = {
      getMyProfile: jest.fn(),
      getMyPosts: jest.fn(),
      getMySavedPosts: jest.fn(),
      getPublicProfile: jest.fn().mockResolvedValue(SAMPLE_PUBLIC_PROFILE),
      followActor: jest.fn().mockRejectedValue(new ProfileError('network')),
    };

    const { result } = await renderHook(() => usePublicProfile(service, 'actor-2'));

    await waitFor(() => {
      expect(result.current.profile.status).toBe('success');
    });

    await act(async () => {
      await result.current.follow();
    });

    expect(result.current.connection).toBeNull();
    expect(result.current.followError).toMatchObject({ kind: 'network' });
  });
});
