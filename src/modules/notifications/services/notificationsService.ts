import { getAvatarPhotoUrl } from '@/shared/lib/authorRemovalMarks';
import type { HttpClient } from '@/shared/lib/http';
import type { NotificationsService } from '../domain/NotificationsService';
import type { NotificationItem, NotificationType } from '../domain/models/NotificationItem';

type ApiNotificationDto = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  actor_id?: string | null;
  actor_name?: string | null;
  actor_avatar_url?: string | null;
  post_id?: string | null;
  comment_id?: string | null;
  connection_id?: string | null;
  connection_status?: string | null;
  category_name?: string | null;
  snippet?: string | null;
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
        { signOutOnUnauthorized: false },
      );
      return response.data.map((item) => {
        const rawAvatar = getAvatarPhotoUrl(item.actor_avatar_url);
        const actorAvatarUrl =
          rawAvatar && !rawAvatar.includes('cdn.asisco.org/avatars/maria') ? rawAvatar : null;

        return {
          id: item.id,
          type: item.type,
          title: item.title,
          body: item.body,
          actorId: item.actor_id ?? null,
          actorName: item.actor_name ?? null,
          actorAvatarUrl,
          postId: item.post_id ?? null,
          commentId: item.comment_id ?? null,
          connectionId: item.connection_id ?? null,
          connectionStatus: item.connection_status ?? null,
          categoryName: item.category_name ?? null,
          snippet: item.snippet ?? null,
          isRead: item.is_read,
          createdAt: item.created_at,
        };
      });
    },

    async markAllRead(): Promise<void> {
      await client.request('/notifications/read-all', {
        method: 'PATCH',
        signOutOnUnauthorized: false,
      });
    },
  };
}
