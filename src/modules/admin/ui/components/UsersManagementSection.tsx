import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { AdminResource } from '@/modules/admin/application/useAdminDashboard';
import type { AdminErrorKind } from '@/modules/admin/domain/models/AdminError';
import type { ModeratorAccount } from '@/modules/admin/domain/models/ModeratorAccount';
import {
  BORDER_WIDTH,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  RADIUS,
  SIZE,
  SPACING,
} from '@/shared/theme';
import { Avatar } from '@/shared/ui/atoms/Avatar';
import { Button } from '@/shared/ui/atoms/Button';
import { Input } from '@/shared/ui/atoms/Input';
import { TextButton } from '@/shared/ui/atoms/TextButton';
import { ConfirmDialog } from '@/shared/ui/organisms/ConfirmDialog';

import { ADMIN_STRINGS } from '../strings';

type UserStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

type UsersManagementSectionProps = {
  users: AdminResource<ModeratorAccount[]>;
  busyUserId: string | null;
  operationError: { kind: AdminErrorKind } | null;
  onSearch: (query: string) => void;
  onUpdateStatus: (userAccountId: string, isActive: boolean) => Promise<boolean>;
  onToggleModerator: (userAccountId: string, shouldBeModerator: boolean) => Promise<boolean>;
  onRetry: () => void;
};

const STATUS_FILTERS: { key: UserStatusFilter; label: string }[] = [
  { key: 'ALL', label: ADMIN_STRINGS.users.filters.ALL },
  { key: 'ACTIVE', label: ADMIN_STRINGS.users.filters.ACTIVE },
  { key: 'INACTIVE', label: ADMIN_STRINGS.users.filters.INACTIVE },
];

export function UsersManagementSection({
  users,
  busyUserId,
  operationError,
  onSearch,
  onUpdateStatus,
  onToggleModerator,
  onRetry,
}: UsersManagementSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('ALL');
  const [userToSuspend, setUserToSuspend] = useState<ModeratorAccount | null>(null);

  const visibleUsers =
    users.status === 'success'
      ? users.data.filter((item) => {
          const isActive = item.isActive !== false;
          if (statusFilter === 'ACTIVE' && !isActive) {
            return false;
          }
          if (statusFilter === 'INACTIVE' && isActive) {
            return false;
          }
          const q = searchQuery.trim().toLowerCase();
          if (q.length === 0) {
            return true;
          }
          return (
            item.username.toLowerCase().includes(q) ||
            item.email.toLowerCase().includes(q) ||
            (item.displayName?.toLowerCase().includes(q) ?? false)
          );
        })
      : [];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Input
          accessibilityLabel={ADMIN_STRINGS.users.searchLabel}
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setSearchQuery}
          placeholder={ADMIN_STRINGS.users.searchPlaceholder}
          value={searchQuery}
        />
        <Button
          label={ADMIN_STRINGS.searchAction}
          variant="outline"
          onPress={() => onSearch(searchQuery)}
          iconRight="search"
        />
        <View style={styles.filtersRow}>
          {STATUS_FILTERS.map((option) => {
            const isSelected = statusFilter === option.key;
            return (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                accessibilityState={{ selected: isSelected }}
                onPress={() => setStatusFilter(option.key)}
                style={[styles.filterPill, isSelected && styles.filterPillActive]}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {operationError !== null ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {ADMIN_STRINGS.errors[operationError.kind] ?? ADMIN_STRINGS.genericError}
        </Text>
      ) : null}

      <View style={styles.listHeading}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {ADMIN_STRINGS.users.title}
        </Text>
        {users.status === 'success' ? (
          <Text style={styles.secondary}>
            {visibleUsers.length} {ADMIN_STRINGS.users.count}
          </Text>
        ) : null}
      </View>

      {users.status === 'loading' ? (
        <ActivityIndicator
          accessibilityLabel={ADMIN_STRINGS.loading}
          color={COLORS.primary}
          style={styles.status}
        />
      ) : null}

      {users.status === 'error' ? (
        <View style={styles.status}>
          <Text accessibilityRole="alert" style={styles.error}>
            {ADMIN_STRINGS.errors[users.error.kind] ?? ADMIN_STRINGS.genericError}
          </Text>
          <TextButton label={ADMIN_STRINGS.retry} onPress={onRetry} />
        </View>
      ) : null}

      {users.status === 'success' && visibleUsers.length === 0 ? (
        <Text style={styles.empty}>{ADMIN_STRINGS.users.empty}</Text>
      ) : null}

      {users.status === 'success'
        ? visibleUsers.map((account) => {
            const isActive = account.isActive !== false;
            const isAdminAccount = account.role.toUpperCase() === 'ADMIN';
            const isModeratorAccount = account.localRole === 'MODERATOR';
            const isBusy = busyUserId === account.id;
            const labelName = account.displayName || account.username;

            return (
              <View key={account.id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <Avatar name={labelName} photoUrl={account.avatarUrl ?? null} size="small" />
                  <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.username} numberOfLines={1}>
                        {labelName}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          isActive ? styles.activeBadge : styles.inactiveBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            isActive ? styles.activeBadgeText : styles.inactiveBadgeText,
                          ]}
                        >
                          {isActive
                            ? ADMIN_STRINGS.users.activeBadge
                            : ADMIN_STRINGS.users.inactiveBadge}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.secondary}>@{account.username}</Text>
                    <Text style={styles.secondary}>{account.email}</Text>
                    <Text style={styles.roleLine}>
                      {ADMIN_STRINGS.role}: {account.role}
                      {isModeratorAccount ? ' · MODERATOR' : ''}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  {account.actorId ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${ADMIN_STRINGS.users.viewProfile} ${account.username}`}
                      onPress={() =>
                        router.push({
                          pathname: '/users/[userId]',
                          params: { userId: account.actorId! },
                        })
                      }
                      style={({ pressed }) => [styles.actionPill, pressed && styles.pressed]}
                    >
                      <Text style={styles.actionPillText}>{ADMIN_STRINGS.users.viewProfile}</Text>
                    </Pressable>
                  ) : null}

                  {!isAdminAccount ? (
                    <>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${
                          isModeratorAccount
                            ? ADMIN_STRINGS.users.removeModerator
                            : ADMIN_STRINGS.users.makeModerator
                        } ${account.username}`}
                        disabled={isBusy}
                        onPress={() => void onToggleModerator(account.id, !isModeratorAccount)}
                        style={({ pressed }) => [styles.actionPill, pressed && styles.pressed]}
                      >
                        <Text style={styles.actionPillText}>
                          {isModeratorAccount
                            ? ADMIN_STRINGS.users.removeModerator
                            : ADMIN_STRINGS.users.makeModerator}
                        </Text>
                      </Pressable>

                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${
                          isActive ? ADMIN_STRINGS.users.suspend : ADMIN_STRINGS.users.activate
                        } ${account.username}`}
                        disabled={isBusy}
                        onPress={() => {
                          if (isActive) {
                            setUserToSuspend(account);
                          } else {
                            void onUpdateStatus(account.id, true);
                          }
                        }}
                        style={({ pressed }) => [
                          styles.actionPill,
                          isActive ? styles.dangerPill : styles.primaryPill,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.actionPillText,
                            isActive ? styles.dangerPillText : styles.primaryPillText,
                          ]}
                        >
                          {isActive ? ADMIN_STRINGS.users.suspend : ADMIN_STRINGS.users.activate}
                        </Text>
                      </Pressable>
                    </>
                  ) : null}
                </View>
              </View>
            );
          })
        : null}

      <ConfirmDialog
        visible={userToSuspend !== null}
        title={ADMIN_STRINGS.users.suspendTitle}
        message={ADMIN_STRINGS.users.suspendMessage}
        confirmLabel={ADMIN_STRINGS.users.suspend}
        cancelLabel={ADMIN_STRINGS.cancel}
        onConfirm={() => {
          if (userToSuspend !== null) {
            void onUpdateStatus(userToSuspend.id, false);
          }
          setUserToSuspend(null);
        }}
        onCancel={() => setUserToSuspend(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.s14,
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
  filtersRow: {
    flexDirection: 'row',
    gap: SPACING.s8,
  },
  filterPill: {
    flex: 1,
    minHeight: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s12_5,
  },
  filterTextActive: {
    color: COLORS.onPrimary,
  },
  listHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s16,
  },
  error: {
    color: COLORS.danger,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14,
    textAlign: 'center',
  },
  status: {
    alignItems: 'center',
    gap: SPACING.s8,
    paddingVertical: SPACING.s20,
  },
  empty: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14,
    textAlign: 'center',
    paddingVertical: SPACING.s20,
  },
  userCard: {
    gap: SPACING.s12,
    padding: SPACING.s14,
    backgroundColor: COLORS.surface,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.s12,
  },
  userInfo: {
    flex: 1,
    gap: SPACING.s2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.s8,
  },
  username: {
    flex: 1,
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s15,
  },
  statusBadge: {
    paddingHorizontal: SPACING.s8,
    paddingVertical: SPACING.s2,
    borderRadius: RADIUS.pill,
  },
  activeBadge: {
    backgroundColor: COLORS.secondarySoft,
  },
  inactiveBadge: {
    backgroundColor: COLORS.accentSoft,
  },
  statusBadgeText: {
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s11_5,
  },
  activeBadgeText: {
    color: COLORS.primary,
  },
  inactiveBadgeText: {
    color: COLORS.danger,
  },
  secondary: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s13,
  },
  roleLine: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s12_5,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s8,
  },
  actionPill: {
    minHeight: SIZE.touchTarget,
    paddingHorizontal: SPACING.s12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.button,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  actionPillText: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s12_5,
  },
  primaryPill: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  primaryPillText: {
    color: COLORS.onPrimary,
  },
  dangerPill: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.danger,
  },
  dangerPillText: {
    color: COLORS.danger,
  },
  pressed: {
    opacity: 0.7,
  },
});
