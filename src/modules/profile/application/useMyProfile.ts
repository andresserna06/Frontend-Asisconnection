import { useCallback, useState } from 'react';

import type { MySubmissionStatus, ProfileService } from '@/modules/profile/domain/ProfileService';
import { useAsyncData } from '@/shared/hooks/useAsyncData';

export type ProfileContentTab = 'posts' | 'saved' | 'submissions';

// Data of the own profile screen: the profile, own approved posts, saved bookmarks, and moderation submissions.
export function useMyProfile(service: ProfileService) {
  const [activeTab, setActiveTab] = useState<ProfileContentTab>('posts');
  const [submissionStatus, setSubmissionStatus] = useState<MySubmissionStatus | undefined>(
    undefined,
  );

  const loadProfile = useCallback(() => service.getMyProfile(), [service]);
  const loadPosts = useCallback(() => service.getMyPosts(), [service]);
  const loadSaved = useCallback(
    () =>
      activeTab === 'saved' && service.getMySavedPosts
        ? service.getMySavedPosts()
        : Promise.resolve([]),
    [activeTab, service],
  );
  const loadSubmissions = useCallback(
    () =>
      activeTab === 'submissions' && service.getMySubmissions
        ? service.getMySubmissions(submissionStatus)
        : Promise.resolve([]),
    [activeTab, service, submissionStatus],
  );

  const profile = useAsyncData(loadProfile);
  const posts = useAsyncData(loadPosts);
  const savedPosts = useAsyncData(loadSaved);
  const submissions = useAsyncData(loadSubmissions);

  return {
    profile,
    posts,
    savedPosts,
    submissions,
    activeTab,
    selectTab: setActiveTab,
    submissionStatus,
    selectSubmissionStatus: setSubmissionStatus,
  };
}
