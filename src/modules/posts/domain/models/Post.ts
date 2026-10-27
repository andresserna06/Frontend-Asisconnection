import type { RoleCode } from '@/modules/auth';

import type { CategoryCode } from './Category';

// Who wrote a post. Fields follow the expected contract (docs/api-profile.md).
export type PostAuthor = {
  id: string;
  fullName: string;
  roles: RoleCode[];
  photoUrl: string | null;
};

// A forum post as the backend sends it (docs/api-profile.md).
export type Post = {
  id: string;
  category: CategoryCode;
  text: string;
  imageUrl: string | null;
  // Alternative text of the image for screen readers.
  imageDescription: string | null;
  // ISO 8601.
  createdAt: string;
  likeCount: number;
  commentCount: number;
  author: PostAuthor;
};
