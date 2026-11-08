import type { HttpClient } from '@/shared/lib/http';
import { groupNotificationsByPeriod } from '../domain/models/NotificationItem';
import { createNotificationsService } from './notificationsService';

describe('notificationsService & groupNotificationsByPeriod', () => {
  it('lists notifications and marks all as read via backend endpoints', async () => {
    const request = jest
      .fn()
      .mockResolvedValueOnce({
        data: [
          {
            id: 'notif-1',
            type: 'COMMENT_ON_POST',
            title: 'Nuevo comentario',
            body: 'Carlos comentó en tu publicación.',
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ],
      })
      .mockResolvedValueOnce({ marked_read: true });
    const client: HttpClient = { request };
    const service = createNotificationsService(client);

    const items = await service.listNotifications();
    expect(request).toHaveBeenCalledWith('/notifications?page=1&limit=50');
    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe('Nuevo comentario');

    await service.markAllRead();
    expect(request).toHaveBeenCalledWith('/notifications/read-all', { method: 'PATCH' });
  });

  it('groups notifications into Hoy, Ayer, Últimos 7 días, Últimos 30 días and discards older items', () => {
    const now = new Date('2026-04-20T12:00:00.000Z');
    const grouped = groupNotificationsByPeriod(
      [
        {
          id: 'n-today',
          type: 'COMMENT_ON_POST',
          title: 'Hoy',
          body: 'Hace 2 horas',
          isRead: false,
          createdAt: '2026-04-20T10:00:00.000Z',
        },
        {
          id: 'n-yesterday',
          type: 'LIKE_ON_POST',
          title: 'Ayer',
          body: 'Hace 30 horas',
          isRead: false,
          createdAt: '2026-04-19T06:00:00.000Z',
        },
        {
          id: 'n-week',
          type: 'REPLY_TO_COMMENT',
          title: 'Semana',
          body: 'Hace 4 días',
          isRead: true,
          createdAt: '2026-04-16T12:00:00.000Z',
        },
        {
          id: 'n-month',
          type: 'FOUNDATION_ANNOUNCEMENT',
          title: 'Mes',
          body: 'Hace 15 días',
          isRead: true,
          createdAt: '2026-04-05T12:00:00.000Z',
        },
        {
          id: 'n-old',
          type: 'COMMENT_ON_POST',
          title: 'Antigua',
          body: 'Hace 45 días',
          isRead: true,
          createdAt: '2026-03-01T12:00:00.000Z',
        },
      ],
      now,
    );

    expect(grouped.Hoy.map((n) => n.id)).toEqual(['n-today']);
    expect(grouped.Ayer.map((n) => n.id)).toEqual(['n-yesterday']);
    expect(grouped['Últimos 7 días'].map((n) => n.id)).toEqual(['n-week']);
    expect(grouped['Últimos 30 días'].map((n) => n.id)).toEqual(['n-month']);
  });
});
