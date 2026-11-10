import type { LocalMediaFile } from '@/shared/domain/models/LocalMediaFile';

import type { NewPostInput, PostSubmissionResult } from './models/PostSubmission';

export type PostsService = {
  createPost(input: NewPostInput): Promise<PostSubmissionResult>;
  uploadMedia?(media: LocalMediaFile): Promise<string>;
};
