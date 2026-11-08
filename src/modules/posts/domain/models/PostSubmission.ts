import type { CategoryCode } from './Category';

export type NewPostInput = {
  category: CategoryCode;
  content: string;
};

export type PostSubmissionStatus = 'PENDING' | 'REJECTED';

export type PostSubmissionResult = {
  id: string;
  status: PostSubmissionStatus;
  message: string;
};

export type PostsErrorKind =
  'validation' | 'sessionExpired' | 'forbidden' | 'rateLimited' | 'network' | 'unknown';

export class PostsError extends Error {
  readonly kind: PostsErrorKind;

  constructor(kind: PostsErrorKind, message?: string) {
    super(message ?? kind);
    this.name = 'PostsError';
    this.kind = kind;
  }
}

export function toPostsError(error: unknown): PostsError {
  return error instanceof PostsError ? error : new PostsError('unknown');
}
