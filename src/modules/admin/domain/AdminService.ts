import type { ModeratorAccount } from './models/ModeratorAccount';
import type {
  ModerationDecision,
  ModerationFilter,
  ModerationItem,
  ModerationItemType,
  ModerationQueuePage,
} from './models/ModerationItem';

export type RemovalTargetPreview = {
  content: string | null;
  isRequestedByAuthor: boolean;
};

export type AdminService = {
  listPending(page: number, filter: ModerationFilter): Promise<ModerationQueuePage>;
  updateModerationStatus(
    id: string,
    itemType: ModerationItemType,
    status: ModerationDecision,
  ): Promise<void>;
  getRemovalTarget?(item: ModerationItem): Promise<RemovalTargetPreview>;
  listModerators(): Promise<ModeratorAccount[]>;
  searchAccounts?(query: string): Promise<ModeratorAccount[]>;
  assignModerator(userAccountId: string): Promise<void>;
  revokeModerator(userAccountId: string): Promise<void>;
};
