import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BORDER_WIDTH, COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SIZE } from '@/shared/theme';

type NavAvatarProps = {
  initials: string;
  photoUrl: string | null;
  isSelected?: boolean;
};

// Profile entry of the navigation bars. The label of the parent is what screen readers read.
export function NavAvatar({ initials, photoUrl, isSelected = false }: NavAvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const hasPhoto = photoUrl !== null && photoUrl !== failedUrl;

  return (
    <View style={[styles.avatar, isSelected && styles.selected]}>
      {hasPhoto ? (
        <Image
          source={photoUrl}
          contentFit="cover"
          onError={() => setFailedUrl(photoUrl)}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <Text style={styles.initials}>{initials}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: SIZE.avatarSmall,
    height: SIZE.avatarSmall,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.accent,
  },
  selected: {
    borderWidth: BORDER_WIDTH.strong,
    borderColor: COLORS.primary,
  },
  initials: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s9_5,
  },
});
