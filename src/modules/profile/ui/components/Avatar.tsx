import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { getInitials } from '@/shared/lib/getInitials';
import { COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SIZE } from '@/shared/theme';

export type AvatarTone = 'accent' | 'secondary' | 'achievement' | 'info';
type AvatarSize = 'large' | 'small';

type AvatarProps = {
  name: string;
  photoUrl: string | null;
  size: AvatarSize;
  tone?: AvatarTone;
};

const TONES: Record<AvatarTone, { background: string; text: string }> = {
  accent: { background: COLORS.accent, text: COLORS.text },
  secondary: { background: COLORS.secondarySoft, text: COLORS.onSecondarySoft },
  achievement: { background: COLORS.achievementSoft, text: COLORS.onAchievementSoft },
  info: { background: COLORS.infoSoft, text: COLORS.onInfoSoft },
};

const AUTHOR_TONES: AvatarTone[] = ['achievement', 'secondary', 'info'];

// Stable tone per person, so the same author always has the same color.
export function getAvatarTone(id: string): AvatarTone {
  const sum = [...id].reduce((total, char) => total + char.charCodeAt(0), 0);
  return AUTHOR_TONES[sum % AUTHOR_TONES.length];
}

// Photo or initials. Decorative: the name next to it is what screen readers read.
// Moves to shared/ui when a second module needs it (T-05).
export function Avatar({ name, photoUrl, size, tone = 'accent' }: AvatarProps) {
  const sizeStyle = size === 'large' ? styles.large : styles.small;
  if (photoUrl !== null) {
    return (
      <Image
        source={photoUrl}
        contentFit="cover"
        style={[styles.base, sizeStyle]}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    );
  }
  return (
    <View
      style={[styles.base, sizeStyle, { backgroundColor: TONES[tone].background }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text
        style={[
          size === 'large' ? styles.largeText : styles.smallText,
          { color: TONES[tone].text },
        ]}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: RADIUS.pill,
  },
  large: {
    width: SIZE.avatarLarge,
    height: SIZE.avatarLarge,
  },
  small: {
    width: SIZE.avatarSmall,
    height: SIZE.avatarSmall,
  },
  largeText: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s30,
  },
  smallText: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s10,
  },
});
