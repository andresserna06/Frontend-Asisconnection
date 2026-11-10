import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { RemovalTargetPreview } from '@/modules/admin/domain/AdminService';
import type { ModerationItem } from '@/modules/admin/domain/models/ModerationItem';
import { useAsyncData } from '@/shared/hooks/useAsyncData';
import { BORDER_WIDTH, COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SPACING } from '@/shared/theme';
import { Button } from '@/shared/ui/atoms/Button';
import { ConfirmDialog } from '@/shared/ui/organisms/ConfirmDialog';

import { ADMIN_STRINGS } from '../strings';

type RemovalRequestCardProps = {
  item: ModerationItem;
  onLoadTarget: (item: ModerationItem) => Promise<RemovalTargetPreview>;
  onResolve: (item: ModerationItem, shouldHide: boolean) => void;
};

function getOwnershipLabel(item: ModerationItem, target: RemovalTargetPreview): string {
  if (!item.author.isRegistered) {
    return ADMIN_STRINGS.removal.guestUnverified;
  }
  return target.isRequestedByAuthor
    ? ADMIN_STRINGS.removal.verified
    : ADMIN_STRINGS.removal.notAuthor;
}

export function RemovalRequestCard({ item, onLoadTarget, onResolve }: RemovalRequestCardProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const load = useCallback(() => onLoadTarget(item), [item, onLoadTarget]);
  const preview = useAsyncData(load);
  const target = preview.status === 'success' ? preview.data : null;
  const isGuest = !item.author.isRegistered;
  const canHide =
    target !== null && target.content !== null && (isGuest || target.isRequestedByAuthor);
  const kindLabel =
    item.removalRequest?.kind === 'post' ? ADMIN_STRINGS.post : ADMIN_STRINGS.comment;

  return (
    <View style={styles.card}>
      <Text style={styles.type}>
        {ADMIN_STRINGS.removal.title} · {kindLabel}
      </Text>
      <Text style={styles.author}>{item.author.displayName}</Text>
      {preview.status === 'loading' && (
        <Text style={styles.note}>{ADMIN_STRINGS.removal.loading}</Text>
      )}
      {preview.status === 'error' && (
        <Text accessibilityRole="alert" style={styles.note}>
          {ADMIN_STRINGS.genericError}
        </Text>
      )}
      {target !== null && (
        <>
          <Text style={styles.content}>{target.content ?? ADMIN_STRINGS.removal.notFound}</Text>
          {target.content !== null && (
            <Text style={styles.note}>{getOwnershipLabel(item, target)}</Text>
          )}
        </>
      )}
      <View style={styles.actions}>
        <View style={styles.action}>
          <Button
            label={ADMIN_STRINGS.removal.hide}
            onPress={() => setIsConfirming(true)}
            isDisabled={!canHide}
          />
        </View>
        <View style={styles.action}>
          <Button
            label={ADMIN_STRINGS.removal.keep}
            variant="outline"
            onPress={() => onResolve(item, false)}
          />
        </View>
      </View>
      <ConfirmDialog
        visible={isConfirming}
        title={ADMIN_STRINGS.removal.title}
        message={ADMIN_STRINGS.removal.confirmMessage}
        confirmLabel={ADMIN_STRINGS.removal.hide}
        cancelLabel={ADMIN_STRINGS.cancel}
        onConfirm={() => {
          setIsConfirming(false);
          onResolve(item, true);
        }}
        onCancel={() => setIsConfirming(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: SPACING.s10,
    padding: SPACING.s16,
    backgroundColor: COLORS.surface,
    borderWidth: BORDER_WIDTH.hairline,
    borderLeftWidth: BORDER_WIDTH.stripe,
    borderColor: COLORS.border,
    borderLeftColor: COLORS.danger,
    borderRadius: RADIUS.card,
  },
  type: {
    color: COLORS.danger,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s14,
  },
  author: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s15,
  },
  content: {
    color: COLORS.textBody,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s15,
  },
  note: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s13,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.s10,
    marginTop: SPACING.s4,
  },
  action: {
    flex: 1,
  },
});
