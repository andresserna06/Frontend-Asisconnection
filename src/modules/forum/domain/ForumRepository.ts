import type { ForumFilter } from './models/ForumCategory';
import type { ForumPost } from './models/ForumPost';

export type ForumFeedRequest = {
  filter: ForumFilter;
};

export type ForumRepository = {
  listPosts(request: ForumFeedRequest): Promise<ForumPost[]>;
  toggleLike?(postId: string): Promise<boolean>;
};
