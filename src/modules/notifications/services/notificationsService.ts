import type { HttpClient } from '@/shared/lib/http';
import type { NotificationsService } from '../domain/NotificationsService';
import type { NotificationItem, NotificationType } from '../domain/models/NotificationItem';

type ApiNotificationDto = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

type ApiNotificationsPageDto = {
  data: ApiNotificationDto[];
};

export function createNotificationsService(client: HttpClient): NotificationsService {
  return {
    async listNotifications(): Promise<NotificationItem[]> {
      const response = await client.request<ApiNotificationsPageDto>(
        '/notifications?page=1&limit=50',
      );
      return response.data.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        body: item.body,
        isRead: item.is_read,
        createdAt: item.created_at,
      }));
    },

    async markAllRead(): Promise<void> {
      await client.request('/notifications/read-all', {
        method: 'PATCH',
      });
    },
  };
}
