import type { AdminEcosystemLink, AdminEcosystemLinkInput } from './models/AdminEcosystemLink';
import type { AdminFaqInput, AdminFaqItem } from './models/AdminFaqItem';
import type {
  ContentReportDecision,
  ContentReportsPage,
  ContentReportStatus,
} from './models/ContentReportItem';
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
  listReports?(page: number, status?: ContentReportStatus): Promise<ContentReportsPage>;
  resolveReport?(id: string, decision: ContentReportDecision): Promise<void>;
  listModerators(): Promise<ModeratorAccount[]>;
  searchAccounts?(query: string): Promise<ModeratorAccount[]>;
  listUsers?(query?: string): Promise<ModeratorAccount[]>;
  updateUserStatus?(userAccountId: string, isActive: boolean): Promise<ModeratorAccount>;
  assignModerator(userAccountId: string): Promise<void>;
  revokeModerator(userAccountId: string): Promise<void>;
  listFaqs?(): Promise<AdminFaqItem[]>;
  createFaq?(input: AdminFaqInput): Promise<AdminFaqItem>;
  updateFaq?(id: string, input: AdminFaqInput): Promise<AdminFaqItem>;
  deleteFaq?(id: string): Promise<void>;
  listEcosystemLinks?(): Promise<AdminEcosystemLink[]>;
  createEcosystemLink?(input: AdminEcosystemLinkInput): Promise<AdminEcosystemLink>;
  updateEcosystemLink?(id: string, input: AdminEcosystemLinkInput): Promise<AdminEcosystemLink>;
  deleteEcosystemLink?(id: string): Promise<void>;
};
