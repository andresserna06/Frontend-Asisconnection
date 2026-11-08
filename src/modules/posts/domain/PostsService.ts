import type { NewPostInput, PostSubmissionResult } from './models/PostSubmission';

export type PostsService = {
  createPost(input: NewPostInput): Promise<PostSubmissionResult>;
};
