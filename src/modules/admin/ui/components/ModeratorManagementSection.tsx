import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

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
import { Button } from '@/shared/ui/atoms/Button';
import { Icon } from '@/shared/ui/atoms/Icon';
import { Input } from '@/shared/ui/atoms/Input';
import { TextButton } from '@/shared/ui/atoms/TextButton';

import { ADMIN_STRINGS } from '../strings';

type ModeratorManagementSectionProps = {
  moderators: AdminResource<ModeratorAccount[]>;
  busyModeratorId: string | null;
  isAssigningModerator: boolean;
  operationError: { kind: AdminErrorKind } | null;
  onAssign: (userAccountId: string) => Promise<boolean>;
  onRevoke: (userAccountId: string) => Promise<boolean>;
  onRetry: () => void;
};

export function ModeratorManagementSection({
  moderators,
  busyModeratorId,
  isAssigningModerator,
  operationError,
  onAssign,
  onRevoke,
  onRetry,
}: ModeratorManagementSectionProps) {
  const [userAccountId, setUserAccountId] = useState('');
  const [inputError, setInputError] = useState(false);

  async function handleAssign() {
    const accountId = userAccountId.trim();
    if (accountId.length === 0) {
      setInputError(true);
      return;
    }

    setInputError(false);
    if (await onAssign(accountId)) {
      setUserAccountId('');
    }
  }

  function confirmRevoke(moderator: ModeratorAccount) {
    Alert.alert(ADMIN_STRINGS.revokeTitle, ADMIN_STRINGS.revokeMessage, [
      { text: ADMIN_STRINGS.cancel, style: 'cancel' },
      {
        text: ADMIN_STRINGS.revoke,
        style: 'destructive',
        onPress: () => {
          void onRevoke(moderator.id);
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {ADMIN_STRINGS.assignTitle}
        </Text>
        <Input
          accessibilityLabel={ADMIN_STRINGS.accountIdLabel}
          autoCapitalize="none"
          autoCorrect={false}
          hasError={inputError}
          onChangeText={setUserAccountId}
          placeholder={ADMIN_STRINGS.accountIdPlaceholder}
          value={userAccountId}
        />
        {inputError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {ADMIN_STRINGS.errors.invalidInput}
          </Text>
        ) : null}
        <Text style={styles.hint}>{ADMIN_STRINGS.accountIdHint}</Text>
        <Button
          label={ADMIN_STRINGS.assign}
          onPress={() => void handleAssign()}
          isLoading={isAssigningModerator}
          isDisabled={isAssigningModerator}
          iconRight="user-plus"
        />
      </View>

      {operationError !== null ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {ADMIN_STRINGS.errors[operationError.kind] ?? ADMIN_STRINGS.genericError}
        </Text>
      ) : null}

      <View style={styles.listHeading}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {ADMIN_STRINGS.moderatorTitle}
        </Text>
        {moderators.status === 'success' ? (
          <Text style={styles.secondary}>
            {moderators.data.length} {ADMIN_STRINGS.moderatorCount.toLowerCase()}
          </Text>
        ) : null}
      </View>
      {moderators.status === 'loading' ? (
        <ActivityIndicator
          accessibilityLabel={ADMIN_STRINGS.loading}
          color={COLORS.primary}
          style={styles.status}
        />
      ) : null}
      {moderators.status === 'error' ? (
        <View style={styles.status}>
          <Text accessibilityRole="alert" style={styles.error}>
            {ADMIN_STRINGS.errors[moderators.error.kind] ?? ADMIN_STRINGS.genericError}
          </Text>
          <TextButton label={ADMIN_STRINGS.retry} onPress={onRetry} />
        </View>
      ) : null}
      {moderators.status === 'success' && moderators.data.length === 0 ? (
        <Text style={styles.empty}>{ADMIN_STRINGS.emptyModerators}</Text>
      ) : null}
      {moderators.status === 'success'
        ? moderators.data.map((moderator) => (
            <View key={moderator.id} style={styles.accountCard}>
              <View style={styles.accountInfo}>
                <Text style={styles.username}>{moderator.username}</Text>
                <Text style={styles.secondary}>{moderator.email}</Text>
                <Text style={styles.secondary}>
                  {ADMIN_STRINGS.role}: {moderator.role}
                </Text>
                <Text style={styles.accountId}>
                  {ADMIN_STRINGS.accountId}: {moderator.id}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${ADMIN_STRINGS.revoke} ${moderator.username}`}
                accessibilityState={{ disabled: busyModeratorId === moderator.id }}
                disabled={busyModeratorId === moderator.id}
                onPress={() => confirmRevoke(moderator)}
                style={({ pressed }) => [styles.revokeButton, pressed && styles.pressed]}
              >
                {busyModeratorId === moderator.id ? (
                  <ActivityIndicator color={COLORS.danger} />
                ) : (
                  <Icon name="user-minus" size={SIZE.iconSmall} color={COLORS.danger} />
                )}
              </Pressable>
            </View>
          ))
        : null}
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
  sectionTitle: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s16,
  },
  listHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hint: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s13,
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
    padding: SPACING.s16,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s12,
    padding: SPACING.s14,
    backgroundColor: COLORS.surface,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
  },
  accountInfo: {
    flex: 1,
    gap: SPACING.s4,
  },
  username: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s15,
  },
  secondary: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s13,
  },
  accountId: {
    color: COLORS.textTertiary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s12,
  },
  revokeButton: {
    width: SIZE.touchTarget,
    height: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.accentSoft,
  },
  pressed: {
    opacity: 0.7,
  },
});
