import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/modules/auth';
import { ForumError } from '@/modules/forum/domain/models/ForumError';
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
  const { sessionToken, signOut } = useAuth();
  const query = useQuery({
    queryKey: ['forum', 'feed', filter],
    enabled: repository !== null && sessionToken !== null,
    queryFn: async () => {
      if (repository === null || sessionToken === null) {
        throw new ForumError('unknown');
      }

      try {
        return await repository.listPosts({ token: sessionToken, filter });
      } catch (error) {
        if (error instanceof ForumError && error.kind === 'sessionExpired') {
          await signOut();
        }
        throw error;
      }
    },
  });

  if (repository === null) {
    return { status: 'unavailable' };
  }

  if (sessionToken === null) {
    return {
      status: 'error',
      error: new ForumError('sessionExpired'),
      retry: () => undefined,
    };
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
