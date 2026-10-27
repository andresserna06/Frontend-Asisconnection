import { StyleSheet, Text, View } from 'react-native';

import { BORDER_WIDTH, COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from '@/shared/theme';

type DataRowProps = {
  label: string;
  value: string;
  hasDivider?: boolean;
};

// Label on the left, value on the right ("Correo · persona@correo.com").
export function DataRow({ label, value, hasDivider = true }: DataRowProps) {
  return (
    <View accessible style={[styles.row, hasDivider && styles.divider]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: SPACING.s14,
    paddingVertical: SPACING.s10,
  },
  divider: {
    borderBottomWidth: BORDER_WIDTH.hairline,
    borderBottomColor: COLORS.surfaceMuted,
  },
  label: {
    flexShrink: 0,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s13,
    color: COLORS.textTertiary,
  },
  value: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s14,
    color: COLORS.textTitle,
  },
});
