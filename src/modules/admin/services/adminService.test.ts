import { AdminError } from '@/modules/admin/domain/models/AdminError';
import type { HttpClient } from '@/shared/lib/http';
import { HttpError } from '@/shared/lib/http';

import { createAdminService } from './adminService';

const pendingPage = {
  data: [
    {
      id: 'item-1',
      item_type: 'POST' as const,
      content: 'Contenido para revisar',
      image_url: null,
      author: {
        display_name: 'Persona de prueba',
        role_label: 'ACUDIENTE',
        is_registered: true,
      },
      created_at: '2026-11-09T12:00:00.000Z',
    },
  ],
  meta: {
    page: 1,
    limit: 20,
    total_items: 1,
    total_pages: 1,
    has_next_page: false,
  },
};

describe('adminService', () => {
  it('recognizes the author of a request when the queue omits the actor id', async () => {
    const request = jest.fn(async () => ({
      data: [{ id: 'post-1', content: 'Mía', author: { display_name: 'maria', actor_id: 'a-1' } }],
    }));
    const service = createAdminService({ request } as unknown as HttpClient);

    await expect(
      service.getRemovalTarget?.({
        id: 'req-1',
        itemType: 'COMMENT',
        content: '#SOLICITUD-ELIMINAR publicacion',
        imageUrl: null,
        postId: 'post-1',
        removalRequest: { kind: 'post' },
        author: { actorId: null, displayName: 'maria', roleLabel: 'ACUDIENTE', isRegistered: true },
        createdAt: '2026-11-09T12:00:00.000Z',
      }),
    ).resolves.toEqual({ content: 'Mía', isRequestedByAuthor: true });
  });

  it('loads and maps a filtered pending moderation page', async () => {
    const client: HttpClient = {
      request: jest.fn().mockResolvedValue(pendingPage),
    };
    const service = createAdminService(client);

    await expect(service.listPending(1, 'POST')).resolves.toEqual({
      items: [
        {
          id: 'item-1',
          itemType: 'POST',
          content: 'Contenido para revisar',
          imageUrl: null,
          postId: null,
          removalRequest: null,
          author: {
            actorId: null,
            displayName: 'Persona de prueba',
            roleLabel: 'ACUDIENTE',
            isRegistered: true,
          },
          createdAt: '2026-11-09T12:00:00.000Z',
        },
      ],
      page: 1,
      totalItems: 1,
      totalPages: 1,
      hasNextPage: false,
    });
    expect(client.request).toHaveBeenCalledWith(
      '/admin/moderation/pending?page=1&limit=20&type=POST',
    );
  });

  it('updates post and comment decisions through their respective endpoints', async () => {
    const client: HttpClient = {
      request: jest.fn().mockResolvedValue(null),
    };
    const service = createAdminService(client);

    await service.updateModerationStatus('post-id', 'POST', 'APPROVED');
    await service.updateModerationStatus('comment-id', 'COMMENT', 'REJECTED');

    expect(client.request).toHaveBeenNthCalledWith(1, '/admin/moderation/posts/post-id/status', {
      method: 'PATCH',
      body: { status: 'APPROVED' },
    });
    expect(client.request).toHaveBeenNthCalledWith(
      2,
      '/admin/moderation/comments/comment-id/status',
      { method: 'PATCH', body: { status: 'REJECTED' } },
    );
  });

  it('lists, assigns, and revokes moderator accounts', async () => {
    const client: HttpClient = {
      request: jest
        .fn()
        .mockResolvedValueOnce([
          {
            id: 'account-id',
            username: 'moderator.user',
            email: 'moderator@example.test',
            rol: 'ACUDIENTE',
          },
        ])
        .mockResolvedValue(null),
    };
    const service = createAdminService(client);

    await expect(service.listModerators()).resolves.toEqual([
      {
        id: 'account-id',
        username: 'moderator.user',
        email: 'moderator@example.test',
        role: 'ACUDIENTE',
      },
    ]);
    await service.assignModerator('account-id');
    await service.revokeModerator('account-id');

    expect(client.request).toHaveBeenNthCalledWith(2, '/admin/moderators/account-id', {
      method: 'PUT',
    });
    expect(client.request).toHaveBeenNthCalledWith(3, '/admin/moderators/account-id', {
      method: 'DELETE',
    });
  });

  it('searches registered accounts via GET /admin/accounts?search=', async () => {
    const client: HttpClient = {
      request: jest.fn().mockResolvedValueOnce([
        {
          id: 'account-2',
          username: 'maria.acudiente',
          email: 'maria@prueba.com',
          rol: 'ACUDIENTE',
          local_role: null,
          display_name: 'María Gómez',
        },
      ]),
    };
    const service = createAdminService(client);

    await expect(service.searchAccounts?.(' maria ')).resolves.toEqual([
      {
        id: 'account-2',
        username: 'maria.acudiente',
        email: 'maria@prueba.com',
        role: 'ACUDIENTE',
        localRole: null,
        displayName: 'María Gómez',
      },
    ]);
    expect(client.request).toHaveBeenCalledWith('/admin/accounts?search=maria');
  });

  it('translates permission errors to an admin domain error', async () => {
    const client: HttpClient = {
      request: jest.fn().mockRejectedValue(new HttpError(403)),
    };
    const service = createAdminService(client);

    await expect(service.listModerators()).rejects.toEqual(new AdminError('forbidden'));
  });
});
