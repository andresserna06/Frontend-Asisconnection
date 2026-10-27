import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { MyProfile } from '@/modules/profile/domain/models/MyProfile';
import { PROFILE_STRINGS } from '@/modules/profile/ui/strings';
import { formatLongDate, formatMonthYear } from '@/shared/lib/formatDate';
import {
  BORDER_WIDTH,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  LINE_HEIGHT,
  OPACITY,
  RADIUS,
  SIZE,
  SPACING,
} from '@/shared/theme';
import { Icon } from '@/shared/ui/atoms/Icon';

import { DataRow } from './DataRow';

const STRINGS = PROFILE_STRINGS.info;

type InfoCardProps = {
  profile: Pick<MyProfile, 'email' | 'birthDate' | 'city' | 'memberSince'>;
  onEdit: () => void;
  onOpenSettings: () => void;
};

// "Mi información": personal data only the person sees.
export function InfoCard({ profile, onEdit, onOpenSettings }: InfoCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text accessibilityRole="header" style={styles.title}>
          {STRINGS.title}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={STRINGS.edit}
          onPress={onEdit}
          style={({ pressed }) => [styles.edit, pressed && styles.pressed]}
        >
          <Text style={styles.editLabel}>{STRINGS.edit}</Text>
        </Pressable>
      </View>

      <View style={styles.note}>
        <Icon name="lock" size={SIZE.iconTiny} color={COLORS.textSecondary} />
        <Text style={styles.noteText}>
          {STRINGS.privacyNote}
          <Text accessibilityRole="link" onPress={onOpenSettings} style={styles.noteLink}>
            {STRINGS.privacyLink}
          </Text>
          .
        </Text>
      </View>

      <DataRow label={STRINGS.email} value={profile.email} />
      <DataRow
        label={STRINGS.birthDate}
        value={profile.birthDate ? formatLongDate(profile.birthDate) : STRINGS.notAdded}
      />
      <DataRow label={STRINGS.city} value={profile.city ?? STRINGS.notAdded} />
      <DataRow
        label={STRINGS.memberSince}
        value={formatMonthYear(profile.memberSince)}
        hasDivider={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingTop: SPACING.s14,
    paddingHorizontal: SPACING.s16,
    paddingBottom: SPACING.s4,
    backgroundColor: COLORS.surface,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.s4,
  },
  title: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s16,
    color: COLORS.textTitle,
  },
  edit: {
    minHeight: SIZE.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: SPACING.s12,
  },
  pressed: {
    opacity: OPACITY.pressed,
  },
  editLabel: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s13_5,
    color: COLORS.primary,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s8,
    paddingTop: SPACING.s2,
    paddingBottom: SPACING.s8,
    borderBottomWidth: BORDER_WIDTH.hairline,
    borderBottomColor: COLORS.surfaceMuted,
  },
  noteText: {
    flex: 1,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s12_5,
    lineHeight: LINE_HEIGHT.note,
    color: COLORS.textSecondary,
  },
  noteLink: {
    fontFamily: FONT_FAMILY.bodyBold,
    color: COLORS.primary,
  },
});
