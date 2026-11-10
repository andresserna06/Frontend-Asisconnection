export type ModerationItemType = 'POST' | 'COMMENT';
export type ModerationFilter = 'ALL' | ModerationItemType;
export type ModerationDecision = 'APPROVED' | 'REJECTED';

export type ModerationItem = {
  id: string;
  itemType: ModerationItemType;
  content: string;
  imageUrl: string | null;
  author: {
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
