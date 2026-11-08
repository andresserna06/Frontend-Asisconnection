import { useCallback, useEffect, useMemo, useState } from 'react';

import type { NotificationsService } from '../domain/NotificationsService';
import {
  groupNotificationsByPeriod,
  type NotificationItem,
  type NotificationPeriod,
} from '../domain/models/NotificationItem';

export type UseNotificationsResult = {
  items: NotificationItem[];
  grouped: Record<NotificationPeriod, NotificationItem[]>;
  isLoading: boolean;
  hasMarkedAllRead: boolean;
  markAllRead: () => Promise<void>;
};

export function useNotifications(service: NotificationsService): UseNotificationsResult {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMarkedAllRead, setHasMarkedAllRead] = useState(false);

  useEffect(() => {
    let isMounted = true;
    service
      .listNotifications()
      .then((loaded) => {
        if (!isMounted) return;
        setItems(loaded);
      })
      .catch(() => {
        if (!isMounted) return;
        setItems([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [service]);

  const markAllRead = useCallback(async () => {
    try {
      await service.markAllRead();
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setHasMarkedAllRead(true);
    } catch {
      // Best-effort UI update
    }
  }, [service]);

  const grouped = useMemo(() => groupNotificationsByPeriod(items), [items]);

  return {
    items,
    grouped,
    isLoading,
    hasMarkedAllRead,
    markAllRead,
  };
}
