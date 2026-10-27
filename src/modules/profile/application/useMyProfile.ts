import { useCallback, useState } from 'react';

import type { ProfileService } from '@/modules/profile/domain/ProfileService';
import { useAsyncData } from '@/shared/hooks/useAsyncData';

export type ProfileTab = 'posts' | 'saved';

// Data of the own profile screen: the profile and the list of the selected tab.
// Each tab's list is loaded when the tab is shown.
export function useMyProfile(service: ProfileService) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');

  const loadProfile = useCallback(() => service.getMyProfile(), [service]);
  const loadPosts = useCallback(
    () => (activeTab === 'posts' ? service.getMyPosts() : service.getMySavedPosts()),
    [service, activeTab],
  );

  const profile = useAsyncData(loadProfile);
  const posts = useAsyncData(loadPosts);

  return { profile, posts, activeTab, selectTab: setActiveTab };
}
