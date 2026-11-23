import type { CreateContentReportInput } from '@/shared/domain/models/ContentReport';

import type { ForumFilter } from './models/ForumCategory';
import type { ForumPost } from './models/ForumPost';

export type ForumFeedMode = 'discover' | 'following';

export type ForumFeedRequest = {
  filter: ForumFilter;
  feed?: ForumFeedMode;
  search?: string;
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
  getPostById?(postId: string): Promise<ForumPost>;
  toggleLike?(postId: string): Promise<boolean>;
  toggleBookmark?(postId: string): Promise<boolean>;
  deletePost?(postId: string): Promise<boolean>;
  reportPost?(input: CreateContentReportInput): Promise<void>;
  listPendingModeration?(): Promise<ModerationPendingItem[]>;
  moderateItem?(
    id: string,
    itemType: 'POST' | 'COMMENT',
    status: 'APPROVED' | 'REJECTED',
  ): Promise<void>;
};
