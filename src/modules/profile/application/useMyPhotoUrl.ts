import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useAuth } from '@/modules/auth';
import { useProfileService } from '@/modules/profile/useProfileService';

const MY_PHOTO_QUERY_KEY = ['profile', 'myPhoto'];

// Photo of the signed-in person for the navigation bars (guests have no profile).
export function useMyPhotoUrl(): string | null {
  const { status, isAnonymous, user } = useAuth();
  const service = useProfileService();
  const query = useQuery({
    queryKey: [...MY_PHOTO_QUERY_KEY, user?.username],
    enabled: status === 'signedIn' && !isAnonymous,
    queryFn: async () => (await service.getMyProfile()).photoUrl,
  });

  return query.data ?? null;
}

export function useRefreshMyPhotoUrl() {
  const queryClient = useQueryClient();

  return useCallback(
    () => void queryClient.invalidateQueries({ queryKey: MY_PHOTO_QUERY_KEY }),
    [queryClient],
  );
}
