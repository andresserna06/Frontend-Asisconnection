import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { ForumFeedMode, ForumFeedRequest } from '@/modules/forum/domain/ForumRepository';
import type { ForumFilter } from '@/modules/forum/domain/models/ForumCategory';
import type { ForumPost } from '@/modules/forum/domain/models/ForumPost';
import type { CreateContentReportInput } from '@/shared/domain/models/ContentReport';
import { getReactionViewer } from '@/shared/hooks/useReactionToggle';

import { useForumRepository } from './ForumRepositoryProvider';

export type ForumFeedOptions = {
  feed?: ForumFeedMode;
  search?: string;
};

export type ForumFeedState =
  | { status: 'unavailable' }
  | { status: 'loading' }
  | { status: 'error'; error: Error; retry: () => void }
  | { status: 'success'; posts: ForumPost[]; refresh: () => void; isRefreshing: boolean };

export function useForumFeed(filter: ForumFilter, options?: ForumFeedOptions): ForumFeedState {
  const repository = useForumRepository();
  const viewerKey = getReactionViewer();
  const feed = options?.feed;
  const trimmedSearch = options?.search?.trim() ?? '';

  const query = useQuery({
    queryKey: ['forum', 'feed', viewerKey, filter, feed ?? 'discover', trimmedSearch],
    enabled: repository !== null,
    refetchOnMount: 'always',
    queryFn: async () => {
      if (repository === null) {
        throw new Error('Forum service is not configured.');
      }

      const request: ForumFeedRequest = {
        filter,
        ...(feed && feed !== 'discover' ? { feed } : {}),
        ...(trimmedSearch.length > 0 ? { search: trimmedSearch } : {}),
      };

      return repository.listPosts(request);
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

export function useTogglePostBookmark() {
  const repository = useForumRepository();
  const queryClient = useQueryClient();

  return async (postId: string): Promise<boolean> => {
    if (!repository?.toggleBookmark) {
      throw new Error('Forum service is not configured.');
    }
    const isBookmarked = await repository.toggleBookmark(postId);
    void queryClient.invalidateQueries({ queryKey: ['forum', 'feed'] });
    return isBookmarked;
  };
}

export function useReportPost() {
  const repository = useForumRepository();

  return async (input: CreateContentReportInput): Promise<void> => {
    if (!repository?.reportPost) {
      throw new Error('Forum service is not configured.');
    }
    await repository.reportPost(input);
  };
}
