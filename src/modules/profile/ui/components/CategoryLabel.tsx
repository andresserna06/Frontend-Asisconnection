import { StyleSheet, Text } from 'react-native';

import { CATEGORIES, type CategoryCode } from '@/modules/posts';
import { CATEGORY_COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SPACING } from '@/shared/theme';

type CategoryLabelProps = {
  category: CategoryCode;
};

// Solid category pill on a post card. Always text plus color, never color alone.
export function CategoryLabel({ category }: CategoryLabelProps) {
  const palette = CATEGORY_COLORS[category];
  return (
    <Text style={[styles.label, { backgroundColor: palette.label, color: palette.onLabel }]}>
      {CATEGORIES[category].label}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    overflow: 'hidden',
    paddingVertical: SPACING.s3,
    paddingHorizontal: SPACING.s10,
    borderRadius: RADIUS.pill,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s11_5,
  },
});
