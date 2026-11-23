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

  it('lists and resolves community content reports via /admin/moderation/reports', async () => {
    const client: HttpClient = {
      request: jest
        .fn()
        .mockResolvedValueOnce({
          data: [
            {
              id: 'rep-1',
              target_type: 'POST',
              target_id: 'post-1',
              target_content_preview: 'Vista previa de la publicación reportada',
              reason: 'INAPPROPRIATE_CONTENT',
              details: 'Lenguaje inapropiado',
              status: 'OPEN',
              created_at: '2026-11-23T05:00:00.000Z',
              resolved_at: null,
            },
          ],
          meta: {
            page: 1,
            limit: 20,
            total_items: 1,
            total_pages: 1,
            has_next_page: false,
          },
        })
        .mockResolvedValueOnce(null),
    };
    const service = createAdminService(client);

    await expect(service.listReports?.(1, 'OPEN')).resolves.toEqual({
      items: [
        {
          id: 'rep-1',
          targetType: 'POST',
          targetId: 'post-1',
          targetContentPreview: 'Vista previa de la publicación reportada',
          reason: 'INAPPROPRIATE_CONTENT',
          details: 'Lenguaje inapropiado',
          status: 'OPEN',
          createdAt: '2026-11-23T05:00:00.000Z',
          resolvedAt: null,
        },
      ],
      page: 1,
      totalItems: 1,
      totalPages: 1,
      hasNextPage: false,
    });
    expect(client.request).toHaveBeenNthCalledWith(
      1,
      '/admin/moderation/reports?page=1&limit=20&status=OPEN',
    );

    await service.resolveReport?.('rep-1', { status: 'RESOLVED', rejectTarget: true });
    expect(client.request).toHaveBeenNthCalledWith(2, '/admin/moderation/reports/rep-1/resolve', {
      method: 'PATCH',
      body: { status: 'RESOLVED', reject_target: true },
    });
  });

  it('performs CRUD operations for FAQs and Ecosystem links', async () => {
    const client: HttpClient = {
      request: jest
        .fn()
        .mockResolvedValueOnce({
          data: [
            {
              id: 'faq-1',
              category: 'Inscripciones',
              question: '¿Cómo me inscribo?',
              answer: 'Diligencia el formulario.',
            },
          ],
        })
        .mockResolvedValueOnce({
          id: 'faq-2',
          category: 'Programas',
          question: '¿Qué es AULA UP?',
          answer: 'Plataforma pedagógica.',
        })
        .mockResolvedValueOnce({
          id: 'faq-2',
          category: 'Programas',
          question: '¿Qué es AULA UP?',
          answer: 'Plataforma pedagógica actualizada.',
        })
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          data: [
            {
              id: 'link-1',
              project_name: 'SUMA 21',
              url: 'https://suma21.fundacionasisco.org',
              description: 'Inclusión social',
            },
          ],
        })
        .mockResolvedValueOnce({
          id: 'link-2',
          project_name: 'SON UP',
          url: 'https://sonup-nuevo.org',
          description: 'Formación musical',
        })
        .mockResolvedValueOnce(null),
    };
    const service = createAdminService(client);

    const faqs = await service.listFaqs?.();
    expect(faqs?.[0]?.question).toBe('¿Cómo me inscribo?');

    const createdFaq = await service.createFaq?.({
      category: 'Programas',
      question: '¿Qué es AULA UP?',
      answer: 'Plataforma pedagógica.',
    });
    expect(createdFaq?.id).toBe('faq-2');

    const updatedFaq = await service.updateFaq?.('faq-2', {
      category: 'Programas',
      question: '¿Qué es AULA UP?',
      answer: 'Plataforma pedagógica actualizada.',
    });
    expect(updatedFaq?.answer).toBe('Plataforma pedagógica actualizada.');

    await service.deleteFaq?.('faq-2');

    const links = await service.listEcosystemLinks?.();
    expect(links?.some((item) => item.projectName === 'SUMA 21')).toBe(true);

    const updatedLink = await service.updateEcosystemLink?.('link-2', {
      projectName: 'SON UP',
      url: 'https://sonup-nuevo.org',
      description: 'Formación musical',
    });
    expect(updatedLink?.url).toBe('https://sonup-nuevo.org');

    await service.deleteEcosystemLink?.('link-2');
  });
});
