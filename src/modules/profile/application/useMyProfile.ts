import { useCallback } from 'react';

import type { ProfileService } from '@/modules/profile/domain/ProfileService';
import { useAsyncData } from '@/shared/hooks/useAsyncData';

// Data of the own profile screen: the profile and its posts.
export function useMyProfile(service: ProfileService) {
  const loadProfile = useCallback(() => service.getMyProfile(), [service]);
  const loadPosts = useCallback(() => service.getMyPosts(), [service]);

  const profile = useAsyncData(loadProfile);
  const posts = useAsyncData(loadPosts);

  return { profile, posts };
}
