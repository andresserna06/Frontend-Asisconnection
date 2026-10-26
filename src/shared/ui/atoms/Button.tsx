import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

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

import { Icon, type IconName } from './Icon';

type ButtonVariant = 'primary' | 'outline';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  iconRight?: IconName;
  isLoading?: boolean;
  isDisabled?: boolean;
};

const CONTENT_COLOR: Record<ButtonVariant, string> = {
  primary: COLORS.onPrimary,
  outline: COLORS.onAccentSoft,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  iconRight,
  isLoading = false,
  isDisabled = false,
}: ButtonProps) {
  const isInactive = isDisabled || isLoading;
  const contentColor = CONTENT_COLOR[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isInactive, busy: isLoading }}
      disabled={isInactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && pressedStyles[variant],
        isDisabled && styles.disabled,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={contentColor} />
      ) : (
        <>
          <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
          {iconRight && <Icon name={iconRight} size={SIZE.iconButton} color={contentColor} />}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.s8,
    borderRadius: RADIUS.button,
  },
  primary: {
    height: SIZE.button,
    backgroundColor: COLORS.primary,
  },
  outline: {
    height: SIZE.buttonSecondary,
    backgroundColor: COLORS.surface,
    borderWidth: BORDER_WIDTH.strong,
    borderColor: COLORS.accent,
  },
  disabled: {
    opacity: OPACITY.disabled,
  },
  label: {
    fontFamily: FONT_FAMILY.headingBold,
  },
  primaryLabel: {
    fontSize: FONT_SIZE.s16_5,
    color: COLORS.onPrimary,
  },
  outlineLabel: {
    fontSize: FONT_SIZE.s16,
    color: COLORS.onAccentSoft,
  },
});

const pressedStyles = StyleSheet.create({
  primary: {
    backgroundColor: COLORS.primaryPressed,
  },
  outline: {
    backgroundColor: COLORS.accentSoft,
  },
});
