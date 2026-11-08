import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import type { CategoryCode } from '@/modules/posts/domain/models/Category';
import {
  type PostsError,
  type PostSubmissionResult,
  toPostsError,
} from '@/modules/posts/domain/models/PostSubmission';
import type { PostsService } from '@/modules/posts/domain/PostsService';

export type PostDraftIssue = 'contentRequired' | 'categoryRequired';

export function useCreatePost(service: PostsService) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftIssue, setDraftIssue] = useState<PostDraftIssue | null>(null);
  const [error, setError] = useState<PostsError | null>(null);
  const isSubmittingRef = useRef(false);

  async function submit(input: {
    category: CategoryCode | null;
    content: string;
  }): Promise<PostSubmissionResult | null> {
    if (isSubmittingRef.current) {
      return null;
    }

    const trimmedContent = input.content.trim();
    if (trimmedContent === '') {
      setDraftIssue('contentRequired');
      setError(null);
      return null;
    }
    if (input.category === null) {
      setDraftIssue('categoryRequired');
      setError(null);
      return null;
    }

    setDraftIssue(null);
    setError(null);
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const result = await service.createPost({
        category: input.category,
        content: trimmedContent,
      });
      await queryClient.invalidateQueries({ queryKey: ['forum', 'feed'] });
      return result;
    } catch (caught) {
      setError(toPostsError(caught));
      return null;
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  function clearFeedback() {
    setDraftIssue(null);
    setError(null);
  }

  return { submit, clearFeedback, isSubmitting, draftIssue, error };
}
