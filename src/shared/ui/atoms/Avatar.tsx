import { Image } from 'expo-image';
import { useState } from 'react';
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

export function getAvatarTone(id: string): AvatarTone {
  const sum = [...id].reduce((total, char) => total + char.charCodeAt(0), 0);
  return AUTHOR_TONES[sum % AUTHOR_TONES.length];
}

// Decorative: the adjacent name is what screen readers read.
// Falls back to the initials when there is no photo or it cannot be loaded.
export function Avatar({ name, photoUrl, size, tone = 'accent' }: AvatarProps) {
  const sizeStyle = size === 'large' ? styles.large : styles.small;
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  if (photoUrl !== null && photoUrl.trim().length > 0 && photoUrl !== failedUrl) {
    return (
      <Image
        source={photoUrl}
        contentFit="cover"
        onError={() => setFailedUrl(photoUrl)}
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
