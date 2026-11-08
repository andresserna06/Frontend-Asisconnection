import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_FAMILY, FONT_SIZE, SIZE, SPACING } from '@/shared/theme';
import { Icon } from '@/shared/ui/atoms/Icon';

type ConsentCheckboxProps = {
  label: string;
  isChecked: boolean;
  onToggle: () => void;
  error?: string | null;
};

const ICON_SIZE = 22;

// Express consent required by the backend (Ley 1581 de 2012) before signing in.
export function ConsentCheckbox({ label, isChecked, onToggle, error }: ConsentCheckboxProps) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isChecked }}
        accessibilityLabel={label}
        onPress={onToggle}
        style={styles.row}
      >
        <Icon
          name={isChecked ? 'check-square' : 'square'}
          size={ICON_SIZE}
          color={error ? COLORS.danger : COLORS.primary}
        />
        <Text style={styles.label}>{label}</Text>
      </Pressable>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.s8,
  },
  row: {
    minHeight: SIZE.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s10,
  },
  label: {
    flex: 1,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s13_5,
    color: COLORS.textBody,
  },
  error: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s13,
    color: COLORS.danger,
  },
});
