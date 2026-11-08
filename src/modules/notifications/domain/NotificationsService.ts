import type { NotificationItem } from './models/NotificationItem';

export type NotificationsService = {
  listNotifications(): Promise<NotificationItem[]>;
  markAllRead(): Promise<void>;
};
