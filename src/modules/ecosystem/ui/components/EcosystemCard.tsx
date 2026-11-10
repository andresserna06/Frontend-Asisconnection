import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  BORDER_WIDTH,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  OPACITY,
  RADIUS,
  SIZE,
  SPACING,
} from '@/shared/theme';
import { Icon, type IconName } from '@/shared/ui/atoms/Icon';

import { ECOSYSTEM_STRINGS } from '../strings';

type EcosystemItem = {
  title: string;
  description: string;
  icon: IconName;
  tone: keyof typeof TONES;
};

type EcosystemCardProps = {
  item: EcosystemItem;
  onPress?: () => void;
};

// One-off geometry of the decorative circle in the corner of the card.
const DECOR_CIRCLE = { size: 132, top: -52, right: -38 };

const TONES = {
  accent: { stripe: COLORS.accent, background: COLORS.accentSoft, foreground: COLORS.onAccentSoft },
  secondary: {
    stripe: COLORS.secondary,
    background: COLORS.secondarySoft,
    foreground: COLORS.primary,
  },
  info: { stripe: COLORS.info, background: COLORS.infoSoft, foreground: COLORS.onInfoSoft },
  achievement: {
    stripe: COLORS.achievement,
    background: COLORS.achievementSoft,
    foreground: COLORS.onAchievementSoft,
  },
} as const;

export function EcosystemCard({ item, onPress }: EcosystemCardProps) {
  const tone = TONES[item.tone];
  const cardStyle = [styles.card, { borderLeftColor: tone.stripe }];

  const content = (
    <>
      <View style={[styles.decorCircle, { backgroundColor: tone.background }]} />
      <View style={[styles.iconBox, { backgroundColor: tone.background }]}>
        <Icon name={item.icon} size={SIZE.ecosystemIcon / 2} color={tone.foreground} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        {onPress !== undefined && (
          <View style={[styles.openPill, { backgroundColor: tone.background }]}>
            <Text style={[styles.openLabel, { color: tone.foreground }]}>
              {ECOSYSTEM_STRINGS.open}
            </Text>
            <Icon name="external-link" size={SIZE.iconTiny} color={tone.foreground} />
          </View>
        )}
      </View>
    </>
  );

  if (onPress !== undefined) {
    return (
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${item.title}. ${item.description}`}
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: SIZE.ecosystemCardMin,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s16,
    padding: SPACING.s18,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: BORDER_WIDTH.hairline,
    borderLeftWidth: BORDER_WIDTH.stripe,
    borderColor: COLORS.border,
    borderRadius: RADIUS.ecosystemCard,
  },
  pressed: {
    opacity: OPACITY.pressed,
  },
  decorCircle: {
    position: 'absolute',
    width: DECOR_CIRCLE.size,
    height: DECOR_CIRCLE.size,
    top: DECOR_CIRCLE.top,
    right: DECOR_CIRCLE.right,
    borderRadius: RADIUS.pill,
  },
  iconBox: {
    width: SIZE.ecosystemIcon,
    height: SIZE.ecosystemIcon,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.ecosystemIcon,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
    gap: SPACING.s4,
  },
  title: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s20,
  },
  description: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s15,
  },
  openPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s5,
    marginTop: SPACING.s6,
    paddingHorizontal: SPACING.s12,
    paddingVertical: SPACING.s5,
    borderRadius: RADIUS.pill,
  },
  openLabel: {
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s13,
  },
});
