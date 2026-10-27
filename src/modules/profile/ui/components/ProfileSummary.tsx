import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RoleBadge, type RoleCode } from '@/modules/auth';
import { PROFILE_STRINGS } from '@/modules/profile/ui/strings';
import { Icon } from '@/shared/ui/atoms/Icon';
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

import { Avatar } from './Avatar';

// Extra touch area so the 32 px camera button reaches 44 px.
const CAMERA_HIT_SLOP = (SIZE.touchTarget - SIZE.avatarAction) / 2;

type ProfileSummaryProps = {
  fullName: string;
  roles: readonly RoleCode[];
  photoUrl: string | null;
  onChangePhoto: () => void;
};

// Avatar with the camera button, name and role.
export function ProfileSummary({ fullName, roles, photoUrl, onChangePhoto }: ProfileSummaryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Avatar name={fullName} photoUrl={photoUrl} size="large" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={PROFILE_STRINGS.changePhoto}
          hitSlop={CAMERA_HIT_SLOP}
          onPress={onChangePhoto}
          style={({ pressed }) => [styles.camera, pressed && styles.pressed]}
        >
          <Icon name="camera" size={SIZE.iconSmall} color={COLORS.textTitle} />
        </Pressable>
      </View>
      <View style={styles.identity}>
        <Text accessibilityRole="header" style={styles.name}>
          {fullName}
        </Text>
        <RoleBadge roles={roles} size="medium" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s16,
  },
  avatar: {
    width: SIZE.avatarLarge,
    height: SIZE.avatarLarge,
  },
  camera: {
    position: 'absolute',
    right: -SPACING.s4,
    bottom: -SPACING.s2,
    width: SIZE.avatarAction,
    height: SIZE.avatarAction,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: BORDER_WIDTH.medium,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.pill,
  },
  pressed: {
    opacity: OPACITY.pressed,
  },
  identity: {
    flex: 1,
    alignItems: 'flex-start',
    gap: SPACING.s6,
  },
  name: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s22,
    lineHeight: LINE_HEIGHT.name,
    color: COLORS.textTitle,
  },
});
