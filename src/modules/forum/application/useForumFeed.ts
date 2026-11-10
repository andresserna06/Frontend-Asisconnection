import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { ForumFilter } from '@/modules/forum/domain/models/ForumCategory';
import type { ForumPost } from '@/modules/forum/domain/models/ForumPost';
import { getReactionViewer } from '@/shared/hooks/useReactionToggle';

import { useForumRepository } from './ForumRepositoryProvider';

export type ForumFeedState =
  | { status: 'unavailable' }
  | { status: 'loading' }
  | { status: 'error'; error: Error; retry: () => void }
  | { status: 'success'; posts: ForumPost[]; refresh: () => void; isRefreshing: boolean };

export function useForumFeed(filter: ForumFilter): ForumFeedState {
  const repository = useForumRepository();
  const viewerKey = getReactionViewer();
  const query = useQuery({
    queryKey: ['forum', 'feed', viewerKey, filter],
    enabled: repository !== null,
    queryFn: async () => {
      if (repository === null) {
        throw new Error('Forum service is not configured.');
      }

      return repository.listPosts({ filter });
    },
  });

  if (repository === null) {
    return { status: 'unavailable' };
  }

  if (query.isLoading) {
    return { status: 'loading' };
  }

  if (query.isError) {
    return { status: 'error', error: query.error, retry: () => void query.refetch() };
  }

  if (query.data === undefined) {
    return {
      status: 'error',
      error: new Error('Forum feed query completed without data.'),
      retry: () => void query.refetch(),
    };
  }

  return {
    status: 'success',
    posts: query.data,
    refresh: () => void query.refetch(),
    isRefreshing: query.isFetching,
  };
}

export function useTogglePostLike() {
  const repository = useForumRepository();
  const queryClient = useQueryClient();

  // Resolves with whether the like is active after the toggle (answer of the server).
  return async (postId: string): Promise<boolean> => {
    if (!repository?.toggleLike) {
      throw new Error('Forum service is not configured.');
    }
    const isActive = await repository.toggleLike(postId);
    void queryClient.invalidateQueries({ queryKey: ['forum', 'feed'] });
    return isActive;
  };
}
