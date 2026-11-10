import type { ForumFilter } from './models/ForumCategory';
import type { ForumPost } from './models/ForumPost';

export type ForumFeedRequest = {
  filter: ForumFilter;
};

export type ModerationPendingItem = {
  id: string;
  itemType: 'POST' | 'COMMENT';
  content: string;
  authorDisplayName: string;
  createdAt: string;
};

export type ForumRepository = {
  listPosts(request: ForumFeedRequest): Promise<ForumPost[]>;
  toggleLike?(postId: string): Promise<boolean>;
  listPendingModeration?(): Promise<ModerationPendingItem[]>;
  moderateItem?(
    id: string,
    itemType: 'POST' | 'COMMENT',
    status: 'APPROVED' | 'REJECTED',
  ): Promise<void>;
};
