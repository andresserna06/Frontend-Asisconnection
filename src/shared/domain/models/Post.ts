import type { CategoryCode } from './CategoryCode';
import type { RoleCode } from './RoleCode';

export type PostReactionType = 'LIKE' | 'SUPPORT' | 'THANKS';

export type PostAuthor = {
  id: string;
  fullName: string;
  roles: RoleCode[];
  photoUrl: string | null;
};

export type Post = {
  id: string;
  category: CategoryCode;
  text: string;
  imageUrl: string | null;
  imageDescription: string | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  author: PostAuthor;
  viewerReactions?: PostReactionType[];
  isBookmarked?: boolean;
};
