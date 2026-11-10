import { ProfileError } from '@/modules/profile/domain/models/ProfileError';
import { createHttpClient } from '@/shared/lib/http';

import { createProfileService } from './profileService';

const BASE_URL = 'https://api.example.test/v1';
const fetchMock = jest.spyOn(globalThis, 'fetch');

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  fetchMock.mockReset();
});

afterAll(() => {
  fetchMock.mockRestore();
});

describe('createProfileService', () => {
  it('loads the own profile from /actors/me and maps ActorProfileResponseDto to MyProfile', async () => {
    const service = createProfileService(createHttpClient(BASE_URL));
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        id: 'actor-1',
        user_account_id: 'u-1',
        username: 'persona.prueba',
        email: 'persona@prueba.com',
        primary_role: 'ACUDIENTE',
        first_names: 'Persona',
        last_names: 'Prueba',
        avatar_url: 'https://cdn.asisco.org/avatar.jpg',
        short_bio: 'Acudiente',
        posts_count: 2,
        followers_count: 5,
        following_count: 3,
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
      }),
    );

    await expect(service.getMyProfile()).resolves.toEqual({
      id: 'actor-1',
      fullName: 'Persona Prueba',
      roles: ['ACUDIENTE'],
      photoUrl: 'https://cdn.asisco.org/avatar.jpg',
      email: 'persona@prueba.com',
      birthDate: null,
      city: null,
      memberSince: '2026-03-01T00:00:00.000Z',
      postCount: 2,
      followerCount: 5,
      followingCount: 3,
      savedCount: 0,
      shortBio: 'Acudiente',
      showEmail: false,
      showBirthDate: false,
      showCity: false,
      requireFollowApproval: false,
    });
    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE_URL}/actors/me`);
  });

  it('loads the own approved posts from /actors/me/posts', async () => {
    const service = createProfileService(createHttpClient(BASE_URL));
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: [{ id: 'cat-guides', name: 'Apoyo Pedagógico', main_topic: 'Educación' }],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: [
            {
              id: 'post-1',
              category_id: 'cat-guides',
              content: 'Publicación propia',
              image_url: null,
              media_urls: [],
              author: {
                actor_id: 'actor-1',
                display_name: 'Persona Prueba',
                role_label: 'ACUDIENTE',
                avatar_url: null,
              },
              reactions_summary: { LIKE: 3, SUPPORT: 1, THANKS: 0 },
              comments_count: 2,
              created_at: '2026-10-20T14:30:00.000Z',
            },
          ],
        }),
      );

    await expect(service.getMyPosts()).resolves.toEqual([
      {
        id: 'post-1',
        category: 'guides',
        text: 'Publicación propia',
        imageUrl: null,
        imageDescription: null,
        createdAt: '2026-10-20T14:30:00.000Z',
        likeCount: 4,
        commentCount: 2,
        author: {
          id: 'actor-1',
          fullName: 'Persona Prueba',
          roles: ['ACUDIENTE'],
          photoUrl: null,
        },
      },
    ]);
  });

  it('maps a request without response to a network error', async () => {
    const service = createProfileService(createHttpClient(BASE_URL));
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));
    const promise = service.getMyProfile();
    await expect(promise).rejects.toBeInstanceOf(ProfileError);
    await expect(promise).rejects.toMatchObject({ kind: 'network' });
  });

  it('maps any other failure to an unknown error', async () => {
    const service = createProfileService(createHttpClient(BASE_URL));
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, { data: [] }))
      .mockResolvedValueOnce(jsonResponse(500, {}));
    await expect(service.getMyPosts()).rejects.toMatchObject({ kind: 'unknown' });
  });

  it('updates own profile via PATCH /actors/me', async () => {
    const service = createProfileService(createHttpClient(BASE_URL));
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        id: 'actor-1',
        user_account_id: 'u-1',
        username: 'persona.prueba',
        email: 'persona@prueba.com',
        primary_role: 'ACUDIENTE',
        first_names: 'Lucía',
        last_names: 'Gómez',
        avatar_url: null,
        short_bio: 'Mamá cuidadora',
        posts_count: 1,
        followers_count: 2,
        following_count: 3,
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-02T00:00:00.000Z',
      }),
    );

    const updated = await service.updateMyProfile?.({
      firstNames: 'Lucía',
      lastNames: 'Gómez',
      shortBio: 'Mamá cuidadora',
    });

    expect(updated?.fullName).toBe('Lucía Gómez');
    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE_URL}/actors/me`);
    expect(fetchMock.mock.calls[0][1]?.method).toBe('PATCH');
  });
});
