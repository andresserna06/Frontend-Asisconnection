import { StyleSheet, Text } from 'react-native';

import { COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SPACING } from '@/shared/theme';

export type BadgeTone = 'neutral' | 'accent' | 'primary';
export type BadgeSize = 'small' | 'medium';

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  size?: BadgeSize;
};

// Non-interactive pill label (e.g. a user's role next to their name).
export function Badge({ label, tone = 'neutral', size = 'small' }: BadgeProps) {
  return <Text style={[styles.base, styles[size], styles[tone]]}>{label}</Text>;
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: RADIUS.pill,
    fontFamily: FONT_FAMILY.bodySemiBold,
  },
  small: {
    paddingVertical: SPACING.s1,
    paddingHorizontal: SPACING.s7,
    fontSize: FONT_SIZE.s10_5,
  },
  medium: {
    paddingVertical: SPACING.s3,
    paddingHorizontal: SPACING.s11,
    fontSize: FONT_SIZE.s12,
  },
  neutral: {
    backgroundColor: COLORS.surfaceMuted,
    color: COLORS.onSurfaceMuted,
  },
  accent: {
    backgroundColor: COLORS.accentSoft,
    color: COLORS.onAccentSoft,
  },
  primary: {
    backgroundColor: COLORS.primary,
    color: COLORS.onPrimary,
  },
});
