import { useQuery } from '@tanstack/react-query';

import type { ForumFilter } from '@/modules/forum/domain/models/ForumCategory';
import type { ForumPost } from '@/modules/forum/domain/models/ForumPost';

import { useForumRepository } from './ForumRepositoryProvider';

export type ForumFeedState =
  | { status: 'unavailable' }
  | { status: 'loading' }
  | { status: 'error'; error: Error; retry: () => void }
  | { status: 'success'; posts: ForumPost[]; refresh: () => void; isRefreshing: boolean };

export function useForumFeed(filter: ForumFilter): ForumFeedState {
  const repository = useForumRepository();
  const query = useQuery({
    queryKey: ['forum', 'feed', filter],
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
