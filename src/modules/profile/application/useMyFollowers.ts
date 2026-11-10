import { useCallback } from 'react';

import type { PublicProfile } from '@/modules/profile/domain/models/PublicProfile';
import type { PublicProfileService } from '@/modules/profile/domain/PublicProfileService';
import { useAsyncData } from '@/shared/hooks/useAsyncData';

export function useMyFollowers(service: PublicProfileService) {
  const load = useCallback(
    async (): Promise<PublicProfile[]> => (service.getMyFollowers ? service.getMyFollowers() : []),
    [service],
  );

  return useAsyncData(load);
}
