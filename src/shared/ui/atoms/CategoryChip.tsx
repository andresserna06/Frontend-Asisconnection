import { Pressable, StyleSheet, Text } from 'react-native';

import type { CategoryKey } from '@/shared/theme';
import { CATEGORY_COLORS, COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SPACING } from '@/shared/theme';

type CategoryChipProps =
  | {
      label: string;
      accessibilityLabel: string;
      category: CategoryKey | null;
      variant: 'filter';
      isSelected: boolean;
      onPress: () => void;
    }
  | {
      label: string;
      category: CategoryKey;
      variant: 'label';
    };

export function CategoryChip(props: CategoryChipProps) {
  if (props.variant === 'label') {
    const palette = CATEGORY_COLORS[props.category];
    return (
      <Text style={[styles.labelChip, { backgroundColor: palette.label, color: palette.onLabel }]}>
        {props.label}
      </Text>
    );
  }

  const palette = props.category === null ? null : CATEGORY_COLORS[props.category];
  const borderColor = palette?.main ?? COLORS.primary;
  const textColor = palette?.onSoft ?? COLORS.primary;
  const selectedTextColor = props.category === 'announcements' ? COLORS.text : COLORS.onPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel}
      accessibilityState={{ selected: props.isSelected }}
      onPress={props.onPress}
      style={({ pressed }) => [
        styles.filterChip,
        {
          backgroundColor: props.isSelected ? borderColor : COLORS.surface,
          borderColor,
        },
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[styles.filterLabel, { color: props.isSelected ? selectedTextColor : textColor }]}
      >
        {props.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filterChip: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.s12,
  },
  filterLabel: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s12_5,
  },
  labelChip: {
    overflow: 'hidden',
    paddingVertical: SPACING.s3,
    paddingHorizontal: SPACING.s10,
    borderRadius: RADIUS.pill,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s11_5,
  },
  pressed: {
    opacity: 0.75,
  },
});
