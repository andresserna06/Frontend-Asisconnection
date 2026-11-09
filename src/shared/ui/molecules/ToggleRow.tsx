import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { COLORS, FONT_FAMILY, FONT_SIZE, SIZE, SPACING } from '@/shared/theme';

type ToggleRowProps = {
  label: string;
  valueLabel: string;
  isEnabled: boolean;
  onToggle: () => void;
};

export function ToggleRow({ label, valueLabel, isEnabled, onToggle }: ToggleRowProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: isEnabled }}
      onPress={onToggle}
      style={styles.row}
    >
      <View style={styles.textColumn}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{valueLabel}</Text>
      </View>
      <Switch
        value={isEnabled}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.border, true: COLORS.primary }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: SIZE.touchTarget,
    gap: SPACING.s12,
  },
  textColumn: {
    flex: 1,
    gap: SPACING.s2,
  },
  label: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s14,
  },
  value: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s12,
  },
});
