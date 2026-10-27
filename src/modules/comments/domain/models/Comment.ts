export type CommentAuthor = {
  id: string;
  name: string;
  initials: string;
  // Comments from the foundation carry the «Fundación» badge.
  isFoundation: boolean;
};

export type Comment = {
  id: string;
  author: CommentAuthor;
  publishedAtLabel: string;
  content: string;
  likeCount: number;
  // One level of replies, shown when the thread is expanded.
  replies: Comment[];
};

export type NewComment = {
  postId: string;
  content: string;
  // Id of the top-level comment being answered, or null for a new comment.
  parentId: string | null;
};
