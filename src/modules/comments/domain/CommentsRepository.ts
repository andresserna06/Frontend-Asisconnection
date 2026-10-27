import type { Comment, NewComment } from './models/Comment';

// The service implements this contract when the backend publishes its endpoints.
export type CommentsRepository = {
  listComments(postId: string): Promise<Comment[]>;
  addComment(comment: NewComment): Promise<Comment>;
};

// Total shown in the sheet: top-level comments plus their replies.
export function countComments(comments: Comment[]): number {
  return comments.reduce((total, comment) => total + 1 + comment.replies.length, 0);
}
