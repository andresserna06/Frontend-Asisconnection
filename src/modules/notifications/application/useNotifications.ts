import { useCallback, useEffect, useMemo, useState } from 'react';

import { HttpError } from '@/shared/lib/http';
import type { NotificationsService } from '../domain/NotificationsService';
import {
  groupNotificationsByPeriod,
  type NotificationItem,
  type NotificationPeriod,
} from '../domain/models/NotificationItem';

export type UseNotificationsResult = {
  items: NotificationItem[];
  grouped: Record<NotificationPeriod, NotificationItem[]>;
  hasMarkedAllRead: boolean;
  isLoading: boolean;
  error: 'unauthorized' | 'unavailable' | null;
  markAllRead: () => Promise<void>;
  reload: () => void;
};

export function useNotifications(
  service: NotificationsService,
  enabled = true,
): UseNotificationsResult {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [hasMarkedAllRead, setHasMarkedAllRead] = useState(false);
  const [error, setError] = useState<'unauthorized' | 'unavailable' | null>(null);
  const [reloadCounter, setReloadCounter] = useState(0);
  const [hasSettled, setHasSettled] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isMounted = true;
    service
      .listNotifications()
      .then((loaded) => {
        if (!isMounted) return;
        setItems(loaded);
        setError(null);
        setHasSettled(true);
      })
      .catch((caught: unknown) => {
        if (!isMounted) return;
        setError(
          caught instanceof HttpError && caught.status === 401 ? 'unauthorized' : 'unavailable',
        );
        setHasSettled(true);
      });

    return () => {
      isMounted = false;
    };
  }, [enabled, reloadCounter, service]);

  const reload = useCallback(() => {
    setReloadCounter((current) => current + 1);
  }, []);

  const markAllRead = useCallback(async () => {
    if (!enabled) {
      return;
    }
    try {
      await service.markAllRead();
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setHasMarkedAllRead(true);
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof HttpError && caught.status === 401 ? 'unauthorized' : 'unavailable',
      );
    }
  }, [enabled, service]);

  const grouped = useMemo(() => groupNotificationsByPeriod(items), [items]);

  return {
    items,
    grouped,
    hasMarkedAllRead,
    isLoading: enabled && !hasSettled,
    error,
    markAllRead,
    reload,
  };
}
