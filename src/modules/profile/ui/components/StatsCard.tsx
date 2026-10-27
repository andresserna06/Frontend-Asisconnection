import { StyleSheet, Text, View } from 'react-native';

import { PROFILE_STRINGS } from '@/modules/profile/ui/strings';
import { BORDER_WIDTH, COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SPACING } from '@/shared/theme';

type StatsCardProps = {
  postCount: number;
  followerCount: number;
  followingCount: number;
};

type StatProps = {
  value: number;
  label: string;
  hasDividers?: boolean;
};

function Stat({ value, label, hasDividers = false }: StatProps) {
  return (
    <View
      accessible
      accessibilityLabel={`${value} ${label}`}
      style={[styles.stat, hasDividers && styles.dividers]}
    >
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

// Posts, followers and following counts.
export function StatsCard({ postCount, followerCount, followingCount }: StatsCardProps) {
  return (
    <View style={styles.card}>
      <Stat value={postCount} label={PROFILE_STRINGS.stats.posts} />
      <Stat value={followerCount} label={PROFILE_STRINGS.stats.followers} hasDividers />
      <Stat value={followingCount} label={PROFILE_STRINGS.stats.following} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    paddingVertical: SPACING.s14,
    paddingHorizontal: SPACING.s6,
    backgroundColor: COLORS.surface,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.s2,
  },
  dividers: {
    borderLeftWidth: BORDER_WIDTH.hairline,
    borderRightWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.surfaceMuted,
  },
  value: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s21,
    color: COLORS.textTitle,
  },
  label: {
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s12,
    color: COLORS.textSecondary,
  },
});
