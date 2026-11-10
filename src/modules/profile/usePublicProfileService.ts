import { useMemo } from 'react';

import { useAuthorizedHttpClient } from '@/modules/auth';
import type { PublicProfileService } from '@/modules/profile/domain/PublicProfileService';

import { createPublicProfileService } from './services/publicProfileService';

export function usePublicProfileService(): PublicProfileService {
  const client = useAuthorizedHttpClient();
  return useMemo(() => createPublicProfileService(client), [client]);
}
