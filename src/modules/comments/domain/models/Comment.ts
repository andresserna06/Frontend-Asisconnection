export type CommentAuthor = {
  id: string;
  profileId: string | null;
  username?: string | null;
  name: string;
  initials: string;
  avatarUrl?: string | null;
  // Comments from the foundation carry the «Fundación» badge.
  isFoundation: boolean;
};

export type Comment = {
  id: string;
  author: CommentAuthor;
  publishedAtLabel: string;
  content: string;
  likeCount: number;
  isLiked?: boolean;
  // One level of replies, shown when the thread is expanded.
  replies: Comment[];
};

export type NewComment = {
  postId: string;
  content: string;
  // Id of the top-level comment being answered, or null for a new comment.
  parentId: string | null;
};

export type CommentSubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type CommentSubmissionResult = {
  id: string;
  status: CommentSubmissionStatus;
  message: string;
};
