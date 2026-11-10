import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { AdminResource } from '@/modules/admin/application/useAdminDashboard';
import type { AdminErrorKind } from '@/modules/admin/domain/models/AdminError';
import type {
  ModerationFilter,
  ModerationItem,
  ModerationQueuePage,
} from '@/modules/admin/domain/models/ModerationItem';
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
import { ModerationCard } from './ModerationCard';

type ModerationSectionProps = {
  queue: AdminResource<ModerationQueuePage>;
  filter: ModerationFilter;
  busyItemId: string | null;
  isLoadingMore: boolean;
  loadMoreError: { kind: AdminErrorKind } | null;
  operationError: { kind: AdminErrorKind } | null;
  onFilterChange: (filter: ModerationFilter) => void;
  onRetry: () => void;
  onLoadMore: () => void;
  onDecide: (item: ModerationItem, decision: 'APPROVED' | 'REJECTED') => void;
};

const FILTERS: { value: ModerationFilter; label: string }[] = [
  { value: 'ALL', label: ADMIN_STRINGS.filters.all },
  { value: 'POST', label: ADMIN_STRINGS.filters.posts },
  { value: 'COMMENT', label: ADMIN_STRINGS.filters.comments },
];

export function ModerationSection({
  queue,
  filter,
  busyItemId,
  isLoadingMore,
  loadMoreError,
  operationError,
  onFilterChange,
  onRetry,
  onLoadMore,
  onDecide,
}: ModerationSectionProps) {
  return (
    <View style={styles.container}>
      {operationError !== null ? (
        <Text accessibilityRole="alert" style={styles.operationError}>
          {ADMIN_STRINGS.errors[operationError.kind] ?? ADMIN_STRINGS.genericError}
        </Text>
      ) : null}
      <View style={styles.sectionHeading}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {ADMIN_STRINGS.pendingTitle}
        </Text>
        {queue.status === 'success' ? (
          <Text style={styles.count}>
            {queue.data.totalItems} {ADMIN_STRINGS.pendingCount.toLowerCase()}
          </Text>
        ) : null}
      </View>
      <View style={styles.filters}>
        {FILTERS.map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: filter === option.value }}
            onPress={() => onFilterChange(option.value)}
            style={[styles.filter, filter === option.value && styles.activeFilter]}
          >
            <Text style={[styles.filterText, filter === option.value && styles.activeFilterText]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {queue.status === 'loading' ? (
        <ActivityIndicator
          accessibilityLabel={ADMIN_STRINGS.loading}
          color={COLORS.primary}
          style={styles.status}
        />
      ) : null}
      {queue.status === 'error' ? (
        <View style={styles.status}>
          <Text accessibilityRole="alert" style={styles.message}>
            {ADMIN_STRINGS.errors[queue.error.kind] ?? ADMIN_STRINGS.genericError}
          </Text>
          <TextButton label={ADMIN_STRINGS.retry} onPress={onRetry} />
        </View>
      ) : null}
      {queue.status === 'success' ? (
        <>
          {queue.data.items.length === 0 ? (
            <View style={styles.status}>
              <Text style={styles.message}>{ADMIN_STRINGS.emptyQueue}</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
              {queue.data.items.map((item) => (
                <ModerationCard
                  key={`${item.itemType}-${item.id}`}
                  item={item}
                  isBusy={busyItemId === item.id}
                  onDecide={onDecide}
                />
              ))}
              {loadMoreError !== null ? (
                <Text accessibilityRole="alert" style={styles.message}>
                  {ADMIN_STRINGS.errors[loadMoreError.kind] ?? ADMIN_STRINGS.genericError}
                </Text>
              ) : null}
              {queue.data.hasNextPage ? (
                <Button
                  label={isLoadingMore ? ADMIN_STRINGS.loading : ADMIN_STRINGS.loadMore}
                  onPress={onLoadMore}
                  isLoading={isLoadingMore}
                  isDisabled={isLoadingMore}
                />
              ) : null}
            </ScrollView>
          )}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filters: {
    flexDirection: 'row',
    gap: SPACING.s8,
    paddingHorizontal: SPACING.s20,
    paddingBottom: SPACING.s14,
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
