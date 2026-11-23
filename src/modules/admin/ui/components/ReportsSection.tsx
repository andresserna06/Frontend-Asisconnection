import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { AdminResource } from '@/modules/admin/application/useAdminDashboard';
import type { AdminErrorKind } from '@/modules/admin/domain/models/AdminError';
import type {
  ContentReportDecision,
  ContentReportItem,
  ContentReportsPage,
  ContentReportStatus,
} from '@/modules/admin/domain/models/ContentReportItem';
import {
  BORDER_WIDTH,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  RADIUS,
  SIZE,
  SPACING,
} from '@/shared/theme';
import { Button } from '@/shared/ui/atoms/Button';
import { TextButton } from '@/shared/ui/atoms/TextButton';

import { ADMIN_STRINGS } from '../strings';

type ReportsSectionProps = {
  reports: AdminResource<ContentReportsPage>;
  statusFilter: ContentReportStatus;
  busyReportId: string | null;
  operationError: { kind: AdminErrorKind } | null;
  onStatusFilterChange: (status: ContentReportStatus) => void;
  onRetry: () => void;
  onResolve: (report: ContentReportItem, decision: ContentReportDecision) => void;
};

const STATUS_FILTERS: { value: ContentReportStatus; label: string }[] = [
  { value: 'OPEN', label: ADMIN_STRINGS.reports.filters.OPEN },
  { value: 'RESOLVED', label: ADMIN_STRINGS.reports.filters.RESOLVED },
  { value: 'DISMISSED', label: ADMIN_STRINGS.reports.filters.DISMISSED },
];

function formatCreatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

export function ReportsSection({
  reports,
  statusFilter,
  busyReportId,
  operationError,
  onStatusFilterChange,
  onRetry,
  onResolve,
}: ReportsSectionProps) {
  return (
    <View style={styles.container}>
      {operationError !== null ? (
        <Text accessibilityRole="alert" style={styles.operationError}>
          {ADMIN_STRINGS.errors[operationError.kind] ?? ADMIN_STRINGS.genericError}
        </Text>
      ) : null}

      <View style={styles.sectionHeading}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {ADMIN_STRINGS.reports.title}
        </Text>
        {reports.status === 'success' ? (
          <Text style={styles.count}>
            {reports.data.totalItems} {ADMIN_STRINGS.reports.count.toLowerCase()}
          </Text>
        ) : null}
      </View>

      <View style={styles.filters}>
        {STATUS_FILTERS.map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: statusFilter === option.value }}
            onPress={() => onStatusFilterChange(option.value)}
            style={[styles.filter, statusFilter === option.value && styles.activeFilter]}
          >
            <Text
              style={[styles.filterText, statusFilter === option.value && styles.activeFilterText]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {reports.status === 'loading' ? (
        <ActivityIndicator
          accessibilityLabel={ADMIN_STRINGS.loading}
          color={COLORS.primary}
          style={styles.status}
        />
      ) : null}

      {reports.status === 'error' ? (
        <View style={styles.status}>
          <Text accessibilityRole="alert" style={styles.message}>
            {ADMIN_STRINGS.errors[reports.error.kind] ?? ADMIN_STRINGS.genericError}
          </Text>
          <TextButton label={ADMIN_STRINGS.retry} onPress={onRetry} />
        </View>
      ) : null}

      {reports.status === 'success' ? (
        reports.data.items.length === 0 ? (
          <View style={styles.status}>
            <Text style={styles.message}>{ADMIN_STRINGS.reports.empty}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {reports.data.items.map((report) => {
              const isBusy = busyReportId === report.id;
              const targetLabel =
                report.targetType === 'POST' ? ADMIN_STRINGS.post : ADMIN_STRINGS.comment;
              const reasonLabel = ADMIN_STRINGS.reports.reasons[report.reason] ?? report.reason;

              return (
                <View key={report.id} style={styles.card}>
                  <View style={styles.heading}>
                    <Text style={styles.type}>{targetLabel}</Text>
                    <Text style={styles.date}>{formatCreatedAt(report.createdAt)}</Text>
                  </View>
                  <Text style={styles.reason}>{reasonLabel}</Text>
                  {report.targetContentPreview ? (
                    <View style={styles.previewBox}>
                      <Text style={styles.previewLabel}>{ADMIN_STRINGS.reports.previewLabel}</Text>
                      <Text style={styles.previewText}>{report.targetContentPreview}</Text>
                    </View>
                  ) : null}
                  {report.details ? (
                    <View style={styles.detailsBox}>
                      <Text style={styles.previewLabel}>{ADMIN_STRINGS.reports.detailsLabel}</Text>
                      <Text style={styles.detailsText}>{report.details}</Text>
                    </View>
                  ) : null}

                  {report.status === 'OPEN' ? (
                    <View style={styles.actionsColumn}>
                      <Button
                        label={ADMIN_STRINGS.reports.resolveAndRemove}
                        onPress={() =>
                          onResolve(report, { status: 'RESOLVED', rejectTarget: true })
                        }
                        isLoading={isBusy}
                        isDisabled={isBusy}
                      />
                      <View style={styles.actionsRow}>
                        <View style={styles.action}>
                          <Button
                            label={ADMIN_STRINGS.reports.resolveKeep}
                            variant="outline"
                            onPress={() =>
                              onResolve(report, { status: 'RESOLVED', rejectTarget: false })
                            }
                            isDisabled={isBusy}
                          />
                        </View>
                        <View style={styles.action}>
                          <Button
                            label={ADMIN_STRINGS.reports.dismiss}
                            variant="outline"
                            onPress={() => onResolve(report, { status: 'DISMISSED' })}
                            isDisabled={isBusy}
                          />
                        </View>
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </ScrollView>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.s20,
    paddingBottom: SPACING.s10,
  },
  sectionTitle: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s16,
  },
  count: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s13,
  },
  filters: {
    flexDirection: 'row',
    gap: SPACING.s8,
    paddingHorizontal: SPACING.s20,
    paddingBottom: SPACING.s14,
  },
  filter: {
    minHeight: SIZE.touchTarget,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.s8,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
  },
  activeFilter: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s12,
  },
  activeFilterText: {
    color: COLORS.onPrimary,
  },
  list: {
    gap: SPACING.s12,
    paddingHorizontal: SPACING.s20,
    paddingBottom: SPACING.s24,
  },
  card: {
    gap: SPACING.s10,
    padding: SPACING.s16,
    backgroundColor: COLORS.surface,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
  },
  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.s8,
  },
  type: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s14,
  },
  date: {
    color: COLORS.textTertiary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s12,
  },
  reason: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.headingBold,
    fontSize: FONT_SIZE.s15,
  },
  previewBox: {
    gap: SPACING.s4,
    padding: SPACING.s12,
    borderRadius: RADIUS.field,
    backgroundColor: COLORS.background,
  },
  detailsBox: {
    gap: SPACING.s4,
  },
  previewLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s12,
  },
  previewText: {
    color: COLORS.textBody,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14,
  },
  detailsText: {
    color: COLORS.textStrong,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14,
  },
  actionsColumn: {
    gap: SPACING.s8,
    marginTop: SPACING.s4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.s8,
  },
  action: {
    flex: 1,
  },
  status: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.s8,
    padding: SPACING.s24,
  },
  operationError: {
    paddingHorizontal: SPACING.s20,
    paddingBottom: SPACING.s8,
    color: COLORS.danger,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14,
    textAlign: 'center',
  },
  message: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14,
    textAlign: 'center',
  },
});
