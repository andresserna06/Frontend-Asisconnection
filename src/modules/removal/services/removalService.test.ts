import { HttpError, type HttpClient } from '@/shared/lib/http';

import { createRemovalService } from './removalService';

const COMMENT = {
  kind: 'comment',
  id: 'c-1',
  postId: 'p-1',
  authorName: 'persona',
  authorProfileId: 'actor-1',
} as const;

describe('removalService', () => {
  it('rejects the content for moderators', async () => {
    const request = jest.fn(async () => ({}));

    await createRemovalService({ request } as HttpClient).hideForEveryone(COMMENT);

    expect(request).toHaveBeenCalledWith('/admin/moderation/comments/c-1/status', {
      method: 'PATCH',
      body: { status: 'REJECTED' },
    });
  });

  it('marks the owner content in their own profile', async () => {
    const request = jest.fn(async (_path: string, options?: { method?: string }) =>
      options?.method === 'PATCH' ? {} : { avatar_url: 'https://cdn.test/me.jpg' },
    );

    await createRemovalService({ request } as unknown as HttpClient).removeOwnContent(COMMENT);

    expect(request).toHaveBeenLastCalledWith('/actors/me', {
      method: 'PATCH',
      body: { avatar_url: 'https://cdn.test/me.jpg#removed=cc1' },
    });
  });

  it('sends the request as a comment on the post', async () => {
    const request = jest.fn(async () => ({ status: 'PENDING' }));

    await createRemovalService({ request } as HttpClient).requestRemoval(COMMENT);

    expect(request).toHaveBeenCalledWith('/posts/p-1/comments', {
      method: 'POST',
      body: { content: '#SOLICITUD-ELIMINAR comentario c-1' },
    });
  });

  it('fails when the automatic filter rejects the request', async () => {
    const request = jest.fn(async () => ({ status: 'REJECTED' }));

    await expect(
      createRemovalService({ request } as HttpClient).requestRemoval(COMMENT),
    ).rejects.toMatchObject({ kind: 'unavailable' });
  });

  it('reports the daily limit', async () => {
    const request = jest.fn().mockRejectedValue(new HttpError(429));

    await expect(
      createRemovalService({ request } as HttpClient).requestRemoval(COMMENT),
    ).rejects.toMatchObject({ kind: 'rateLimited' });
  });
});
