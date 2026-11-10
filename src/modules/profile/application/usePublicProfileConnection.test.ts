import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { PublicProfileService } from '@/modules/profile/domain/PublicProfileService';
import type { PublicProfile } from '@/modules/profile/domain/models/PublicProfile';

import { usePublicProfileConnection } from './usePublicProfileConnection';

const TEST_PUBLIC_PROFILE: PublicProfile = {
  id: 'actor-1',
  username: 'persona.publica',
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

describe('usePublicProfileConnection', () => {
  it('loads the current connection state and submits a follow request', async () => {
    const requestFollow = jest.fn(async () => 'pending' as const);
    const service: PublicProfileService = {
      getPublicProfile: jest.fn(async () => TEST_PUBLIC_PROFILE),
      getConnectionStatus: jest.fn(async () => 'notFollowing'),
      requestFollow,
    };
    const { result } = await renderHook(() =>
      usePublicProfileConnection(service, 'actor-1', false),
    );

    await waitFor(() => {
      expect(result.current.connection).toMatchObject({
        status: 'ready',
        relationship: 'notFollowing',
      });
    });

    await act(async () => {
      await result.current.requestFollow();
    });

    expect(requestFollow).toHaveBeenCalledWith('actor-1');
    expect(result.current.connection).toMatchObject({
      status: 'ready',
      relationship: 'pending',
    });
  });

  it('does not request connection data for an anonymous session', async () => {
    const getConnectionStatus = jest.fn(async () => 'notFollowing' as const);
    const service: PublicProfileService = {
      getPublicProfile: jest.fn(async () => TEST_PUBLIC_PROFILE),
      getConnectionStatus,
      requestFollow: jest.fn(async () => 'pending'),
    };
    const { result } = await renderHook(() => usePublicProfileConnection(service, 'actor-1', true));

    expect(result.current.connection).toBe('signInRequired');
    expect(getConnectionStatus).not.toHaveBeenCalled();
  });
});
