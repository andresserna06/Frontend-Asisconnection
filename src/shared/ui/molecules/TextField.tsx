import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from '@/shared/theme';
import { Input, type InputProps } from '@/shared/ui/atoms/Input';

export type TextFieldProps = Omit<InputProps, 'hasError'> & {
  label: string;
  error?: string | null;
};

// Label + input + error message under it.
export function TextField({ label, error, ...inputProps }: TextFieldProps) {
  const hasError = Boolean(error);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Input accessibilityLabel={label} hasError={hasError} {...inputProps} />
      {hasError && (
        <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.s6,
  },
  label: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s13,
    color: COLORS.textStrong,
  },
  error: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s13,
    color: COLORS.danger,
  },
});
