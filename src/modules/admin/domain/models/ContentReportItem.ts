import type {
  ContentReportReason,
  ContentReportTargetType,
} from '@/shared/domain/models/ContentReport';

export type ContentReportStatus = 'OPEN' | 'RESOLVED' | 'DISMISSED';

export type ContentReportDecision = {
  status: 'RESOLVED' | 'DISMISSED';
  rejectTarget?: boolean;
};

export type ContentReportItem = {
  id: string;
  targetType: ContentReportTargetType;
  targetId: string;
  targetContentPreview: string | null;
  reason: ContentReportReason;
  details: string | null;
  status: ContentReportStatus;
  createdAt: string;
  resolvedAt: string | null;
};

export type ContentReportsPage = {
  items: ContentReportItem[];
  page: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
};
