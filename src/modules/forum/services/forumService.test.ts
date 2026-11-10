import { createHttpClient } from '@/shared/lib/http';

import { createForumService, formatRelativeTime, toInitials } from './forumService';

const BASE_URL = 'https://api.example.test/v1';
const fetchMock = jest.spyOn(globalThis, 'fetch');

const CATEGORIES_PAGE = {
  data: [
    { id: 'cat-news', name: 'Noticias de la Fundación', main_topic: 'Institucional' },
    { id: 'cat-health', name: 'Salud y Bienestar', main_topic: 'Salud' },
    { id: 'cat-guides', name: 'Apoyo Pedagógico', main_topic: 'Educación' },
    { id: 'cat-vol', name: 'Voluntariado', main_topic: 'Comunidad' },
  ],
  meta: { page: 1, limit: 50, total: 4, total_pages: 1 },
};

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

describe('forumService helpers', () => {
  it('builds initials from single or multi-word names', () => {
    expect(toInitials('Ana Tallerista')).toBe('AT');
    expect(toInitials('maria')).toBe('MA');
    expect(toInitials('   ')).toBe('AS');
  });

  it('formats relative time labels in Spanish', () => {
    const now = Date.parse('2026-11-07T20:00:00.000Z');
    expect(formatRelativeTime('2026-11-07T19:59:30.000Z', now)).toBe('Ahora');
    expect(formatRelativeTime('2026-11-07T19:45:00.000Z', now)).toBe('Hace 15 min');
    expect(formatRelativeTime('2026-11-07T17:00:00.000Z', now)).toBe('Hace 3 h');
    expect(formatRelativeTime('2026-11-05T20:00:00.000Z', now)).toBe('Hace 2 d');
  });
});

describe('createForumService', () => {
  it('loads categories and maps approved backend posts to ForumPost items', async () => {
    const service = createForumService(createHttpClient(BASE_URL));
    fetchMock.mockResolvedValueOnce(jsonResponse(200, CATEGORIES_PAGE)).mockResolvedValueOnce(
      jsonResponse(200, {
        data: [
          {
            id: 'post-1',
            category_id: 'cat-news',
            content: 'Taller este sábado',
            image_url: 'https://cdn.example.com/pic.jpg',
            media_urls: ['https://cdn.example.com/pic.jpg'],
            author: {
              actor_id: 'actor-1',
              display_name: 'Claudia Henao',
              role_label: 'ACUDIENTE',
              is_registered: true,
            },
            reactions_summary: { LIKE: 4, SUPPORT: 2, THANKS: 1 },
            comments_count: 3,
            created_at: new Date().toISOString(),
          },
        ],
        meta: { page: 1, limit: 20, total: 1, total_pages: 1 },
      }),
    );

    const posts = await service.listPosts({ filter: 'all' });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE_URL}/categories?page=1&limit=50`);
    expect(fetchMock.mock.calls[1][0]).toBe(`${BASE_URL}/posts?page=1&limit=20`);
    expect(posts).toEqual([
      {
        id: 'post-1',
        category: 'announcements',
        author: {
          profileId: 'actor-1',
          id: 'actor-1',
          name: 'Claudia Henao',
          initials: 'CH',
          roleLabel: 'Acudiente',
          avatarUri: null,
        },
        publishedAtLabel: 'Ahora',
        content: 'Taller este sábado',
        media: {
          kind: 'image',
          uri: 'https://cdn.example.com/pic.jpg',
          accessibilityLabel: 'Imagen publicada por Claudia Henao',
        },
        likeCount: 7,
        commentCount: 3,
      },
    ]);
  });

  it('passes categoryId when a specific topic filter is selected and reuses cached categories', async () => {
    const service = createForumService(createHttpClient(BASE_URL));
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, CATEGORIES_PAGE))
      .mockResolvedValueOnce(jsonResponse(200, { data: [], meta: {} }))
      .mockResolvedValueOnce(jsonResponse(200, { data: [], meta: {} }));

    await service.listPosts({ filter: 'questions' });
    await service.listPosts({ filter: 'guides' });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toBe(
      `${BASE_URL}/posts?page=1&limit=20&categoryId=cat-health`,
    );
    expect(fetchMock.mock.calls[2][0]).toBe(
      `${BASE_URL}/posts?page=1&limit=20&categoryId=cat-guides`,
    );
  });

  it('maps 401 to sessionExpired and 403 to forbidden', async () => {
    const service = createForumService(createHttpClient(BASE_URL));
    fetchMock.mockResolvedValueOnce(jsonResponse(401, {}));
    await expect(service.listPosts({ filter: 'all' })).rejects.toThrow('sessionExpired');

    fetchMock.mockResolvedValueOnce(jsonResponse(403, {}));
    await expect(service.listPosts({ filter: 'all' })).rejects.toThrow('forbidden');
  });

  it('toggles a LIKE reaction on a post', async () => {
    const service = createForumService(createHttpClient(BASE_URL));
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { post_id: 'post-1', type: 'LIKE', active: true }),
    );

    await expect(service.toggleLike?.('post-1')).resolves.toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/posts/post-1/reactions`);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({ type: 'LIKE' });
  });

  it('lists pending moderation items and approves or rejects them via /admin/moderation', async () => {
    const service = createForumService(createHttpClient(BASE_URL));
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: [
            {
              id: 'pending-1',
              item_type: 'POST',
              content: 'Publicación en cola',
              author: { display_name: 'Lucía', role_label: 'ACUDIENTE', is_registered: true },
              created_at: '2026-11-08T12:00:00.000Z',
            },
          ],
        }),
      )
      .mockResolvedValueOnce(jsonResponse(200, { id: 'pending-1', status: 'APPROVED' }));

    const pending = await service.listPendingModeration?.();
    expect(pending).toEqual([
      {
        id: 'pending-1',
        itemType: 'POST',
        content: 'Publicación en cola',
        authorDisplayName: 'Lucía',
        createdAt: '2026-11-08T12:00:00.000Z',
      },
    ]);

    await service.moderateItem?.('pending-1', 'POST', 'APPROVED');
    expect(fetchMock.mock.calls[1][0]).toBe(`${BASE_URL}/admin/moderation/posts/pending-1/status`);
    expect(fetchMock.mock.calls[1][1]?.method).toBe('PATCH');
  });
});
