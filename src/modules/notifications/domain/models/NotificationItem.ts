export type NotificationType =
  'COMMENT_ON_POST' | 'REPLY_TO_COMMENT' | 'LIKE_ON_POST' | 'FOUNDATION_ANNOUNCEMENT';

export type NotificationPeriod = 'Hoy' | 'Ayer' | 'Últimos 7 días' | 'Últimos 30 días';

export const NOTIFICATION_PERIODS: readonly NotificationPeriod[] = [
  'Hoy',
  'Ayer',
  'Últimos 7 días',
  'Últimos 30 días',
];

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function groupNotificationsByPeriod(
  items: readonly NotificationItem[],
  now: Date = new Date(),
): Record<NotificationPeriod, NotificationItem[]> {
  const groups: Record<NotificationPeriod, NotificationItem[]> = {
    Hoy: [],
    Ayer: [],
    'Últimos 7 días': [],
    'Últimos 30 días': [],
  };

  const nowMs = now.getTime();

  for (const item of items) {
    const createdMs = new Date(item.createdAt).getTime();
    if (Number.isNaN(createdMs)) continue;
    const diffDays = (nowMs - createdMs) / MS_PER_DAY;
    if (diffDays < 0 || diffDays <= 1) {
      groups.Hoy.push(item);
    } else if (diffDays <= 2) {
      groups.Ayer.push(item);
    } else if (diffDays <= 7) {
      groups['Últimos 7 días'].push(item);
    } else if (diffDays <= 30) {
      groups['Últimos 30 días'].push(item);
    }
  }

  return groups;
}
