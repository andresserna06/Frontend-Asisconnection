import { Image } from 'expo-image';
import { Alert, StyleSheet, Text, View } from 'react-native';

import type {
  ModerationDecision,
  ModerationItem,
} from '@/modules/admin/domain/models/ModerationItem';
import { BORDER_WIDTH, COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SPACING } from '@/shared/theme';
import { Button } from '@/shared/ui/atoms/Button';

import { ADMIN_STRINGS } from '../strings';

type ModerationCardProps = {
  item: ModerationItem;
  isBusy: boolean;
  onDecide: (item: ModerationItem, decision: ModerationDecision) => void;
};

function formatCreatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

export function ModerationCard({ item, isBusy, onDecide }: ModerationCardProps) {
  const contentType = item.itemType === 'POST' ? ADMIN_STRINGS.post : ADMIN_STRINGS.comment;

  function confirmRejection() {
    Alert.alert(ADMIN_STRINGS.rejectTitle, ADMIN_STRINGS.rejectMessage, [
      { text: ADMIN_STRINGS.cancel, style: 'cancel' },
      {
        text: ADMIN_STRINGS.rejected,
        style: 'destructive',
        onPress: () => onDecide(item, 'REJECTED'),
      },
    ]);
  }

  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <Text style={styles.type}>{contentType}</Text>
        <Text style={styles.date}>{formatCreatedAt(item.createdAt)}</Text>
      </View>
      <Text style={styles.author}>{item.author.displayName}</Text>
      <Text style={styles.role}>
        {item.author.isRegistered ? item.author.roleLabel : ADMIN_STRINGS.anonymous}
      </Text>
      <Text style={styles.content}>{item.content}</Text>
      {item.imageUrl !== null && item.itemType === 'POST' ? (
        <Image
          accessibilityLabel={`${ADMIN_STRINGS.post}: imagen adjunta`}
          source={{ uri: item.imageUrl }}
          contentFit="contain"
          style={styles.image}
        />
      ) : null}
      <View style={styles.actions}>
        <View style={styles.action}>
          <Button
            label={ADMIN_STRINGS.approve}
            onPress={() => onDecide(item, 'APPROVED')}
            isLoading={isBusy}
            isDisabled={isBusy}
          />
        </View>
        <View style={styles.action}>
          <Button
            label={ADMIN_STRINGS.reject}
            variant="outline"
            onPress={confirmRejection}
            isDisabled={isBusy}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  author: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s15,
  },
  role: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s13,
  },
  content: {
    color: COLORS.textBody,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s15,
  },
  image: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: RADIUS.control,
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
