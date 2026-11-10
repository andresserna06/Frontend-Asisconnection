import { HttpError, type HttpClient } from '@/shared/lib/http';

import { clearUnfollowedActorsForTests } from './localUnfollowState';
import { createPublicProfileService } from './publicProfileService';

beforeEach(() => {
  clearUnfollowedActorsForTests();
});

describe('publicProfileService', () => {
  it('lists as followers only the accepted connections received by the current actor', async () => {
    const actor = (id: string) => ({
      id,
      username: id,
      primary_role: 'ACUDIENTE',
      first_names: null,
      last_names: null,
      avatar_url: null,
      short_bio: null,
    });
    const request = jest.fn(async (path: string) => {
      if (path === '/actors/me') {
        return actor('me');
      }
      if (path.startsWith('/connections')) {
        return {
          data: [
            { id: '1', requester_actor_id: 'fan', receiver_actor_id: 'me', status: 'ACCEPTED' },
            { id: '2', requester_actor_id: 'me', receiver_actor_id: 'idol', status: 'ACCEPTED' },
            { id: '3', requester_actor_id: 'wait', receiver_actor_id: 'me', status: 'PENDING' },
          ],
          meta: { has_next_page: false },
        };
      }
      return actor(path.split('/').pop() ?? '');
    });
    const service = createPublicProfileService({ request } as unknown as HttpClient);

    const followers = await service.getMyFollowers?.();

    expect(followers?.map((follower) => follower.id)).toEqual(['fan']);
  });

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

  it('unfollows an actor without generating notifications even when the backend returns 404 on DELETE', async () => {
    const request = jest
      .fn()
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
      })
      .mockRejectedValueOnce(new HttpError(404));
    const service = createPublicProfileService({ request } as HttpClient);

    await expect(service.getConnectionStatus('actor-1')).resolves.toBe('following');
    await expect(service.requestUnfollow?.('actor-1')).resolves.toBe('notFollowing');
    await expect(service.getConnectionStatus('actor-1')).resolves.toBe('notFollowing');
  });

  it('loads approved posts for a public actor via GET /actors/:id/posts', async () => {
    const request = jest
      .fn()
      .mockResolvedValueOnce({
        data: [{ id: 'cat-1', name: 'Salud', main_topic: 'Bienestar y Salud' }],
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'post-99',
            category_id: 'cat-1',
            content: 'Publicación pública aprobada',
            image_url: null,
            author: {
              actor_id: 'actor-1',
              display_name: 'Persona Prueba',
              role_label: 'ACUDIENTE',
              avatar_url: null,
            },
            reactions_summary: { LIKE: 2, SUPPORT: 1, THANKS: 0 },
            comments_count: 1,
            created_at: '2026-11-09T10:00:00.000Z',
          },
        ],
      });
    const service = createPublicProfileService({ request } as HttpClient);

    await expect(service.getActorPosts?.('actor-1')).resolves.toEqual([
      {
        id: 'post-99',
        category: 'questions',
        text: 'Publicación pública aprobada',
        imageUrl: null,
        imageDescription: null,
        createdAt: '2026-11-09T10:00:00.000Z',
        likeCount: 3,
        commentCount: 1,
        author: {
          id: 'actor-1',
          fullName: 'Persona Prueba',
          roles: ['ACUDIENTE'],
          photoUrl: null,
        },
      },
    ]);
    expect(request).toHaveBeenCalledWith('/actors/actor-1/posts?page=1&limit=20');
  });
});
