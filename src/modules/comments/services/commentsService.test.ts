import { createHttpClient } from '@/shared/lib/http';

import { createCommentsService } from './commentsService';

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

describe('createCommentsService', () => {
  it('loads approved comments for a post and groups replies under their parent thread', async () => {
    const service = createCommentsService(createHttpClient(BASE_URL));
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        data: [
          {
            id: 'c-1',
            parent_id: null,
            content: '¿Hay que llevar materiales?',
            author: {
              actor_id: 'actor-1',
              display_name: 'Marcela Ramírez',
              role_label: 'ACUDIENTE',
              is_registered: true,
            },
            likes_count: 4,
            created_at: new Date().toISOString(),
          },
          {
            id: 'c-2',
            parent_id: 'c-1',
            content: 'La fundación incluye los materiales.',
            author: {
              actor_id: 'actor-admin',
              display_name: 'ASISCO UP',
              role_label: 'ADMIN',
              is_registered: true,
            },
            likes_count: 6,
            created_at: new Date().toISOString(),
          },
        ],
        meta: { page: 1, limit: 50, total: 2, total_pages: 1 },
      }),
    );

    const comments = await service.listComments('post-1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/posts/post-1/comments?page=1&limit=50`,
      expect.anything(),
    );
    expect(comments).toEqual([
      {
        id: 'c-1',
        author: {
          id: 'actor-1',
          name: 'Marcela Ramírez',
          initials: 'MR',
          isFoundation: false,
        },
        publishedAtLabel: 'ahora',
        content: '¿Hay que llevar materiales?',
        likeCount: 4,
        replies: [
          {
            id: 'c-2',
            author: {
              id: 'actor-admin',
              name: 'ASISCO UP',
              initials: 'AU',
              isFoundation: true,
            },
            publishedAtLabel: 'ahora',
            content: 'La fundación incluye los materiales.',
            likeCount: 6,
            replies: [],
          },
        ],
      },
    ]);
  });

  it('omits parent_id when adding a root comment and includes it when replying', async () => {
    const service = createCommentsService(createHttpClient(BASE_URL));
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(201, {
          id: 'c-3',
          status: 'PENDING',
          message: 'Enviado a moderación',
          created_at: '2026-11-07T20:00:00.000Z',
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse(201, {
          id: 'c-4',
          status: 'PENDING',
          message: 'Enviado a moderación',
          created_at: '2026-11-07T20:00:00.000Z',
        }),
      );

    await expect(
      service.addComment({ postId: 'post-1', content: 'Hola', parentId: null }),
    ).resolves.toEqual({
      id: 'c-3',
      status: 'PENDING',
      message: 'Enviado a moderación',
    });
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({ content: 'Hola' });

    await service.addComment({ postId: 'post-1', content: 'Gracias', parentId: 'c-1' });
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({
      content: 'Gracias',
      parent_id: 'c-1',
    });
  });

  it('toggles a LIKE reaction on a comment', async () => {
    const service = createCommentsService(createHttpClient(BASE_URL));
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { comment_id: 'c-1', type: 'LIKE', active: true }),
    );

    await expect(service.toggleLike?.('c-1')).resolves.toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/comments/c-1/reactions`);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({ type: 'LIKE' });
  });
});
