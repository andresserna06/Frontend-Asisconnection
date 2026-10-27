import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { countComments } from '@/modules/comments/domain/CommentsRepository';
import type { Comment, NewComment } from '@/modules/comments/domain/models/Comment';

import { useCommentsRepository } from './CommentsRepositoryProvider';

export type CommentsState =
  | { status: 'unavailable' }
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'success'; comments: Comment[]; total: number };

export function useComments(postId: string): CommentsState {
  const repository = useCommentsRepository();
  const query = useQuery({
    queryKey: ['comments', postId],
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', postId] }),
  });

  return {
    canComment: repository !== null,
    addComment: mutation.mutateAsync,
    isSending: mutation.isPending,
  };
}
