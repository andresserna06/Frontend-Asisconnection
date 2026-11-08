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

type EcosystemItem = {
  title: string;
  description: string;
  icon: IconName;
  tone: 'accent' | 'secondary' | 'neutral';
};

type EcosystemCardProps = {
  item: EcosystemItem;
  onPress?: () => void;
};

const TONES = {
  accent: { background: COLORS.accentSoft, foreground: COLORS.onAccentSoft },
  secondary: { background: COLORS.secondarySoft, foreground: COLORS.primary },
  neutral: { background: COLORS.surfaceMuted, foreground: COLORS.onSurfaceMuted },
} as const;

export function EcosystemCard({ item, onPress }: EcosystemCardProps) {
  const tone = TONES[item.tone];

  const content = (
    <>
      <View style={[styles.iconBox, { backgroundColor: tone.background }]}>
        <Icon name={item.icon} size={SIZE.ecosystemIcon / 2} color={tone.foreground} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
      <View style={styles.externalIcon}>
        <Icon name="external-link" size={SIZE.iconSmall} color={COLORS.textStrong} />
      </View>
    </>
  );

  if (onPress !== undefined) {
    return (
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${item.title}. ${item.description}`}
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.card}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: SIZE.ecosystemCardMin,
    maxHeight: SIZE.ecosystemCardMax,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s14,
    paddingHorizontal: SPACING.s16,
    backgroundColor: COLORS.surface,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    borderRadius: RADIUS.ecosystemCard,
  },
  pressed: {
    opacity: OPACITY.pressed,
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
    gap: SPACING.s3,
  },
  title: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s17,
  },
  description: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s13_5,
  },
  externalIcon: {
    width: SIZE.ecosystemAction,
    height: SIZE.ecosystemAction,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.background,
  },
});
