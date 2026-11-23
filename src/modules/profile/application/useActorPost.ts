import { useCallback } from 'react';

import type { PublicProfileService } from '@/modules/profile/domain/PublicProfileService';
import type { Post } from '@/shared/domain/models/Post';
import { useAsyncData } from '@/shared/hooks/useAsyncData';

// Fetches the post detail via GET /v1/posts/:id when available, falling back to the author's list.
export function useActorPost(
  service: PublicProfileService,
  actorId: string | undefined,
  postId: string | undefined,
) {
  const load = useCallback(async (): Promise<Post | null> => {
    if (postId === undefined) {
      return null;
    }
    if (service.getPostById) {
      const post = await service.getPostById(postId);
      if (post !== null) {
        return post;
      }
    }
    if (actorId === undefined || !service.getActorPosts) {
      return null;
    }
    const posts = await service.getActorPosts(actorId);
    return posts.find((post) => post.id === postId) ?? null;
  }, [service, actorId, postId]);

  return useAsyncData(load);
}
