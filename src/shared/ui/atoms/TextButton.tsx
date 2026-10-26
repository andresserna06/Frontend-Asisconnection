import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { COLORS, FONT_FAMILY, FONT_SIZE, OPACITY, SIZE, SPACING } from '@/shared/theme';

import { Icon, type IconName } from './Icon';

type TextButtonSize = 'small' | 'medium';

type TextButtonProps = {
  label: string;
  onPress: () => void;
  size?: TextButtonSize;
  iconRight?: IconName;
  // Only for placement in the parent (alignSelf, margins).
  style?: StyleProp<ViewStyle>;
};

// Link-style button: green text, no background, 44 px tall touch area.
export function TextButton({ label, onPress, size = 'medium', iconRight, style }: TextButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.base, pressed && styles.pressed, style]}
    >
      <Text style={[styles.label, styles[size]]}>{label}</Text>
      {iconRight && <Icon name={iconRight} size={SIZE.iconSmall} color={COLORS.primary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: SIZE.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.s7,
  },
  pressed: {
    opacity: OPACITY.pressed,
  },
  label: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    color: COLORS.primary,
  },
  small: {
    fontSize: FONT_SIZE.s13_5,
  },
  medium: {
    fontSize: FONT_SIZE.s14_5,
  },
});
