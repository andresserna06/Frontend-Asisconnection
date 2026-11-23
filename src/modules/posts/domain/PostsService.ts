import type { LocalMediaFile } from '@/shared/domain/models/LocalMediaFile';

import type { NewPostInput, PostSubmissionResult, UpdatePostInput } from './models/PostSubmission';

export type PostsService = {
  createPost(input: NewPostInput): Promise<PostSubmissionResult>;
  updatePost?(postId: string, input: UpdatePostInput): Promise<PostSubmissionResult>;
  deletePost?(postId: string): Promise<boolean>;
  uploadMedia?(media: LocalMediaFile): Promise<string>;
};
