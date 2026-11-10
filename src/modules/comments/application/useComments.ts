import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { countComments } from '@/modules/comments/domain/CommentsRepository';
import type { Comment, NewComment } from '@/modules/comments/domain/models/Comment';
import { getReactionViewer } from '@/shared/hooks/useReactionToggle';

import { useCommentsRepository } from './CommentsRepositoryProvider';

export type CommentsState =
  | { status: 'unavailable' }
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'success'; comments: Comment[]; total: number };

export function useComments(postId: string): CommentsState {
  const repository = useCommentsRepository();
  const viewerKey = getReactionViewer();
  const query = useQuery({
    queryKey: ['comments', viewerKey, postId],
    enabled: repository !== null,
    queryFn: async () => {
      if (repository === null) {
        throw new Error('Comments service is not configured.');
      }
      return repository.listComments(postId);
    },
  });

  if (repository === null) {
    return { status: 'unavailable' };
  }
  if (query.isLoading) {
    return { status: 'loading' };
  }
  if (query.isError || query.data === undefined) {
    return { status: 'error', retry: () => void query.refetch() };
  }
  return { status: 'success', comments: query.data, total: countComments(query.data) };
}

export function useAddComment(postId: string) {
  const repository = useCommentsRepository();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (comment: Omit<NewComment, 'postId'>) => {
      if (repository === null) {
        throw new Error('Comments service is not configured.');
      }
      return repository.addComment({ ...comment, postId });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['comments'] });
      await queryClient.invalidateQueries({ queryKey: ['forum', 'feed'] });
    },
  });

  return {
    canComment: repository !== null,
    addComment: mutation.mutateAsync,
    isSending: mutation.isPending,
  };
}

export function useToggleCommentLike() {
  const repository = useCommentsRepository();
  const queryClient = useQueryClient();

  // Resolves with whether the like is active after the toggle (answer of the server).
  return async (commentId: string): Promise<boolean> => {
    if (!repository?.toggleLike) {
      throw new Error('Comments service is not configured.');
    }
    const isActive = await repository.toggleLike(commentId);
    void queryClient.invalidateQueries({ queryKey: ['comments'] });
    return isActive;
  };
}
