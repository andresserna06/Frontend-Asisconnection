import type { Comment, CommentSubmissionResult, NewComment } from './models/Comment';

export type CommentsRepository = {
  listComments(postId: string): Promise<Comment[]>;
  addComment(comment: NewComment): Promise<CommentSubmissionResult>;
  toggleLike?(commentId: string): Promise<boolean>;
};

// Total shown in the sheet: top-level comments plus their replies.
export function countComments(comments: Comment[]): number {
  return comments.reduce((total, comment) => total + 1 + comment.replies.length, 0);
}
