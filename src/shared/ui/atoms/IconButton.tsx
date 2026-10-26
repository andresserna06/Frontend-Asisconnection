import { Pressable, StyleSheet } from 'react-native';

import { COLORS, OPACITY, RADIUS, SIZE } from '@/shared/theme';

import { Icon, type IconName } from './Icon';

type IconButtonProps = {
  icon: IconName;
  // Required: icon-only controls must be described for screen readers.
  accessibilityLabel: string;
  onPress: () => void;
  color?: string;
};

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  color = COLORS.textSecondary,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
    >
      <Icon name={icon} size={SIZE.icon} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: SIZE.touchTarget,
    height: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.control,
  },
  pressed: {
    opacity: OPACITY.pressed,
  },
});
