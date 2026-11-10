import type { PostSubmissionResult } from '@/modules/posts/domain/models/PostSubmission';
import type { PostsService } from '@/modules/posts/domain/PostsService';

export const TEST_SUBMISSION_RESULT: PostSubmissionResult = {
  id: 'post-1',
  status: 'PENDING',
  message: 'Contenido recibido y enviado a moderación humana antes de su publicación.',
};

export function createFakePostsService(overrides: Partial<PostsService> = {}): PostsService {
  return {
    createPost: jest.fn(async () => TEST_SUBMISSION_RESULT),
    uploadMedia: jest.fn(async () => 'https://example.test/photo.jpg'),
    ...overrides,
  };
}
