export type ContentReportTargetType = 'POST' | 'COMMENT';

export type ContentReportReason =
  'INAPPROPRIATE_CONTENT' | 'HARASSMENT' | 'MINOR_PRIVACY' | 'SPAM' | 'OTHER';

export const CONTENT_REPORT_REASONS: readonly ContentReportReason[] = [
  'INAPPROPRIATE_CONTENT',
  'HARASSMENT',
  'MINOR_PRIVACY',
  'SPAM',
  'OTHER',
] as const;

export type CreateContentReportInput = {
  targetType: ContentReportTargetType;
  targetId: string;
  reason: ContentReportReason;
  details?: string;
};
