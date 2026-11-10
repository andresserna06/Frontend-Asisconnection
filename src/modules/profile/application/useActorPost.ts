import { useCallback } from 'react';

import type { PublicProfileService } from '@/modules/profile/domain/PublicProfileService';
import type { Post } from '@/shared/domain/models/Post';
import { useAsyncData } from '@/shared/hooks/useAsyncData';

// The backend has no endpoint for a single post, so it is looked up in its author's list.
export function useActorPost(
  service: PublicProfileService,
  actorId: string | undefined,
  postId: string | undefined,
) {
  const load = useCallback(async (): Promise<Post | null> => {
    if (actorId === undefined || postId === undefined || !service.getActorPosts) {
      return null;
    }
    const posts = await service.getActorPosts(actorId);
    return posts.find((post) => post.id === postId) ?? null;
  }, [service, actorId, postId]);

  return useAsyncData(load);
}
