import { useMemo } from 'react';

import { useAuthorizedHttpClient } from '@/modules/auth';
import type { EcosystemService } from '@/modules/ecosystem/domain/EcosystemService';

import { createEcosystemService } from './services/ecosystemService';

export function useEcosystemService(): EcosystemService {
  const client = useAuthorizedHttpClient();
  return useMemo(() => createEcosystemService(client), [client]);
}
