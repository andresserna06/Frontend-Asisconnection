import { useMemo } from 'react';

import { useAuthorizedHttpClient } from '@/modules/auth';
import type { RemovalService } from '@/modules/removal/domain/RemovalService';

import { createRemovalService } from './services/removalService';

export function useRemovalService(): RemovalService {
  const client = useAuthorizedHttpClient();
  return useMemo(() => createRemovalService(client), [client]);
}
