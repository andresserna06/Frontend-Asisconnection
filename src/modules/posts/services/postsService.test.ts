import { PostsError } from '@/modules/posts/domain/models/PostSubmission';
import { createHttpClient } from '@/shared/lib/http';

import { createPostsService } from './postsService';

const BASE_URL = 'https://api.example.test/v1';
const fetchMock = jest.spyOn(globalThis, 'fetch');

const CATEGORIES_PAGE = {
  data: [
    { id: 'cat-health', name: 'Salud y Bienestar', main_topic: 'Salud' },
    { id: 'cat-guides', name: 'Apoyo Pedagógico', main_topic: 'Educación' },
    { id: 'cat-vol', name: 'Voluntariado', main_topic: 'Comunidad' },
  ],
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

describe('createPostsService', () => {
  it('resolves the backend category UUID and submits POST /posts', async () => {
    const service = createPostsService(createHttpClient(BASE_URL));
    fetchMock.mockResolvedValueOnce(jsonResponse(200, CATEGORIES_PAGE)).mockResolvedValueOnce(
      jsonResponse(201, {
        id: 'p-1',
        status: 'PENDING',
        rejection_reason: null,
        message: 'Enviado a moderación',
        created_at: '2026-11-07T20:00:00.000Z',
      }),
    );

    await expect(
      service.createPost({ category: 'guides', content: 'Nuevo taller de lectura' }),
    ).resolves.toEqual({
      id: 'p-1',
      status: 'PENDING',
      message: 'Enviado a moderación',
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE_URL}/categories?page=1&limit=50`);
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe(`${BASE_URL}/posts`);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      category_id: 'cat-guides',
      content: 'Nuevo taller de lectura',
    });
  });

  it('maps 401, 403 and 429 to domain errors', async () => {
    const service = createPostsService(createHttpClient(BASE_URL));
    fetchMock.mockResolvedValueOnce(jsonResponse(200, CATEGORIES_PAGE));

    fetchMock.mockResolvedValueOnce(jsonResponse(401, {}));
    await expect(service.createPost({ category: 'questions', content: 'Hola' })).rejects.toEqual(
      new PostsError('sessionExpired'),
    );

    fetchMock.mockResolvedValueOnce(jsonResponse(429, { detail: 'Límite diario' }));
    await expect(service.createPost({ category: 'questions', content: 'Hola' })).rejects.toEqual(
      new PostsError('rateLimited', 'Límite diario'),
    );
  });
});
