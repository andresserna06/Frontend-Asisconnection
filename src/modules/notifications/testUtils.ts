import type { NotificationsService } from './domain/NotificationsService';
import type { NotificationItem } from './domain/models/NotificationItem';

export function createFakeNotificationsService(
  overrides: Partial<NotificationsService> = {},
  initialItems: NotificationItem[] = [],
): NotificationsService {
  return {
    listNotifications: async () => initialItems,
    markAllRead: async () => undefined,
    ...overrides,
  };
}
