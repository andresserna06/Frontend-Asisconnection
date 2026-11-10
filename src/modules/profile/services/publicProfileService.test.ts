import { HttpError, type HttpClient } from '@/shared/lib/http';

import { createPublicProfileService } from './publicProfileService';

describe('publicProfileService', () => {
  it('loads public profile fields and omits personal data whose visibility is disabled', async () => {
    const request = jest.fn(async () => ({
      id: 'actor-1',
      username: 'persona',
      primary_role: 'ACUDIENTE',
      first_names: 'Persona',
      last_names: 'Prueba',
      avatar_url: null,
      short_bio: 'Acudiente',
      email: 'private@example.test',
      birth_date: '1988-05-14',
      city: 'Manizales',
      show_birth_date: false,
      show_city: true,
      posts_count: 3,
      followers_count: 12,
      following_count: 4,
    }));
    const service = createPublicProfileService({ request } as HttpClient);

    await expect(service.getPublicProfile('actor-1')).resolves.toEqual({
      id: 'actor-1',
      fullName: 'Persona Prueba',
      roles: ['ACUDIENTE'],
      photoUrl: null,
      shortBio: 'Acudiente',
      birthDate: null,
      city: 'Manizales',
      postCount: 3,
      followerCount: 12,
      followingCount: 4,
    });
    expect(request).toHaveBeenCalledWith('/actors/actor-1');
  });

  it('encodes the actor ID and maps a missing profile to notFound', async () => {
    const request = jest.fn().mockRejectedValue(new HttpError(404));
    const service = createPublicProfileService({ request } as HttpClient);

    await expect(service.getPublicProfile('actor/id')).rejects.toMatchObject({ kind: 'notFound' });
    expect(request).toHaveBeenCalledWith('/actors/actor%2Fid');
  });

  it('finds an existing connection in later pages', async () => {
    const request = jest
      .fn()
      .mockResolvedValueOnce({ data: [], meta: { has_next_page: true } })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'connection-1',
            requester_actor_id: 'actor-current',
            receiver_actor_id: 'actor-1',
            status: 'ACCEPTED',
          },
        ],
        meta: { has_next_page: false },
      });
    const service = createPublicProfileService({ request } as HttpClient);

    await expect(service.getConnectionStatus('actor-1')).resolves.toBe('following');
    expect(request).toHaveBeenNthCalledWith(1, '/connections?page=1&limit=50');
    expect(request).toHaveBeenNthCalledWith(2, '/connections?page=2&limit=50');
  });

  it('creates a follow request and maps the pending status', async () => {
    const request = jest.fn(async () => ({
      id: 'connection-1',
      requester_actor_id: 'actor-current',
      receiver_actor_id: 'actor-1',
      status: 'PENDING',
    }));
    const service = createPublicProfileService({ request } as HttpClient);

    await expect(service.requestFollow('actor-1')).resolves.toBe('pending');
    expect(request).toHaveBeenCalledWith('/connections', {
      method: 'POST',
      body: { receiver_actor_id: 'actor-1' },
    });
  });
});
