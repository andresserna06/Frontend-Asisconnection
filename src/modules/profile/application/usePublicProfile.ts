import { useCallback, useState } from 'react';

import type { MyProfile } from '@/modules/profile/domain/models/MyProfile';
import { ProfileError } from '@/modules/profile/domain/models/ProfileError';
import type {
  ActorConnectionResult,
  ProfileService,
} from '@/modules/profile/domain/ProfileService';
import type { Post } from '@/shared/domain/models/Post';
import { useAsyncData } from '@/shared/hooks/useAsyncData';

// Application hook for screen 5b (Perfil de otra persona) and follow/connection actions.
export function usePublicProfile(service: ProfileService, actorId: string) {
  const fetchProfile = useCallback(() => {
    if (!service.getPublicProfile) {
      return Promise.reject(new ProfileError('unknown'));
    }
    return service.getPublicProfile(actorId);
  }, [service, actorId]);

  const profile = useAsyncData<MyProfile>(fetchProfile);

  const fetchPosts = useCallback(() => {
    if (!service.getActorPosts) {
      return Promise.resolve([]);
    }
    return service.getActorPosts(actorId);
  }, [service, actorId]);

  const posts = useAsyncData<Post[]>(fetchPosts);

  const [connection, setConnection] = useState<ActorConnectionResult | null>(null);
  const [followError, setFollowError] = useState<ProfileError | null>(null);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);

  const follow = useCallback(async () => {
    if (!service.followActor || isFollowingLoading) return;
    setIsFollowingLoading(true);
    setFollowError(null);
    try {
      const result = await service.followActor(actorId);
      setConnection(result);
    } catch (caught) {
      setFollowError(caught instanceof ProfileError ? caught : new ProfileError('unknown'));
    } finally {
      setIsFollowingLoading(false);
    }
  }, [service, actorId, isFollowingLoading]);

  return {
    profile,
    posts,
    connection,
    followError,
    isFollowingLoading,
    follow,
  };
}
