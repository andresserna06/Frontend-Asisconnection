import { useCallback } from 'react';

import type { PublicProfile } from '@/modules/profile/domain/models/PublicProfile';
import type { PublicProfileService } from '@/modules/profile/domain/PublicProfileService';
import { useAsyncData } from '@/shared/hooks/useAsyncData';

export function useMyFollowers(service: PublicProfileService, actorId?: string) {
  const load = useCallback(async (): Promise<PublicProfile[]> => {
    if (actorId && service.getActorFollowers) {
      return service.getActorFollowers(actorId);
    }
    return service.getMyFollowers ? service.getMyFollowers() : [];
  }, [actorId, service]);

  return useAsyncData(load);
}
