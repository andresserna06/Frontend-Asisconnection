import { useMemo } from 'react';

import { useAuthorizedHttpClient } from '@/modules/auth';
import type { NotificationsService } from './domain/NotificationsService';
import { createNotificationsService } from './services/notificationsService';

export function useNotificationsService(): NotificationsService {
  const client = useAuthorizedHttpClient();
  return useMemo(() => createNotificationsService(client), [client]);
}
