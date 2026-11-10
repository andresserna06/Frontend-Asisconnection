import { useState, type ReactNode, type Ref } from 'react';
import { Platform, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import {
  BORDER_WIDTH,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  LINE_HEIGHT,
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

const MULTILINE_MAX_HEIGHT = 140;

export function Input({ hasError = false, rightAccessory, ref, ...inputProps }: InputProps) {
  // Native multiline inputs grow by themselves; a browser textarea has to be told its height.
  const [webHeight, setWebHeight] = useState<number>(SIZE.input);
  const isWebMultiline = inputProps.multiline === true && Platform.OS === 'web';

  return (
    <View style={styles.container}>
      <TextInput
        ref={ref}
        placeholderTextColor={COLORS.textTertiary}
        style={[
          styles.input,
          inputProps.multiline ? styles.multiline : styles.singleLine,
          isWebMultiline && { height: Math.min(webHeight, MULTILINE_MAX_HEIGHT) },
          rightAccessory !== undefined && styles.inputWithAccessory,
          hasError && styles.inputError,
        ]}
        {...inputProps}
        onContentSizeChange={
          isWebMultiline
            ? (event) =>
                setWebHeight(event.nativeEvent.contentSize.height + 2 * BORDER_WIDTH.hairline)
            : inputProps.onContentSizeChange
        }
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
    paddingHorizontal: SPACING.s14,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s15,
    color: COLORS.text,
    backgroundColor: COLORS.inputBackground,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.field,
  },
  singleLine: {
    height: SIZE.input,
  },
  // The vertical padding centers the first line in the same height as a single-line field.
  multiline: {
    minHeight: SIZE.input,
    maxHeight: MULTILINE_MAX_HEIGHT,
    paddingVertical: SPACING.s13,
    lineHeight: LINE_HEIGHT.body,
    textAlignVertical: 'top',
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
