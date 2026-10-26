import type { ReactNode, Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import {
  BORDER_WIDTH,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  RADIUS,
  SIZE,
  SPACING,
} from '@/shared/theme';

export type InputProps = Omit<TextInputProps, 'style'> & {
  hasError?: boolean;
  // Element shown inside the field on the right (e.g. show/hide password button).
  rightAccessory?: ReactNode;
  ref?: Ref<TextInput>;
};

export function Input({ hasError = false, rightAccessory, ref, ...inputProps }: InputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        ref={ref}
        placeholderTextColor={COLORS.textTertiary}
        style={[
          styles.input,
          rightAccessory !== undefined && styles.inputWithAccessory,
          hasError && styles.inputError,
        ]}
        {...inputProps}
      />
      {rightAccessory !== undefined && <View style={styles.accessory}>{rightAccessory}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  input: {
    height: SIZE.input,
    paddingHorizontal: SPACING.s14,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s15,
    color: COLORS.text,
    backgroundColor: COLORS.inputBackground,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.field,
  },
  inputWithAccessory: {
    paddingRight: SIZE.input,
  },
  inputError: {
    borderColor: COLORS.alert,
  },
  accessory: {
    position: 'absolute',
    right: SPACING.s4,
  },
});
