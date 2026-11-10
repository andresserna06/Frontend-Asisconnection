import type { ModeratorAccount } from './models/ModeratorAccount';
import type {
  ModerationDecision,
  ModerationFilter,
  ModerationItemType,
  ModerationQueuePage,
} from './models/ModerationItem';

export type AdminService = {
  listPending(page: number, filter: ModerationFilter): Promise<ModerationQueuePage>;
  updateModerationStatus(
    id: string,
    itemType: ModerationItemType,
    status: ModerationDecision,
  ): Promise<void>;
  listModerators(): Promise<ModeratorAccount[]>;
  assignModerator(userAccountId: string): Promise<void>;
  revokeModerator(userAccountId: string): Promise<void>;
};
