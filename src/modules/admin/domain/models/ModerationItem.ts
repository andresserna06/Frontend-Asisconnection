import type { RemovalRequest } from '@/modules/removal';

export type ModerationItemType = 'POST' | 'COMMENT';
export type ModerationFilter = 'ALL' | ModerationItemType;
export type ModerationDecision = 'APPROVED' | 'REJECTED';

export type ModerationItem = {
  id: string;
  itemType: ModerationItemType;
  content: string;
  imageUrl: string | null;
  postId?: string | null;
  // Set when this item is a request to remove content rather than content to review.
  removalRequest?: RemovalRequest | null;
  author: {
    actorId?: string | null;
    displayName: string;
    roleLabel: string;
    isRegistered: boolean;
  };
  createdAt: string;
};

export type ModerationQueuePage = {
  items: ModerationItem[];
  page: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
};
