import { Modal, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_FAMILY, FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from '@/shared/theme';
import { Button } from '@/shared/ui/atoms/Button';

const DIALOG_MAX_WIDTH = 440;

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  isBusy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

// Confirmation that works on every platform: Alert.alert does nothing in the browser.
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  isBusy = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View accessibilityViewIsModal style={styles.dialog}>
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          <Text style={styles.message}>{message}</Text>
          {error !== null && (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          )}
          <Button label={confirmLabel} onPress={onConfirm} isLoading={isBusy} isDisabled={isBusy} />
          <Button label={cancelLabel} variant="outline" onPress={onCancel} isDisabled={isBusy} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.s20,
    backgroundColor: COLORS.backdrop,
  },
  dialog: {
    width: '100%',
    maxWidth: DIALOG_MAX_WIDTH,
    gap: SPACING.s12,
    padding: SPACING.s24,
    borderRadius: RADIUS.cardLarge,
    backgroundColor: COLORS.surface,
  },
  title: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s20,
    color: COLORS.textTitle,
  },
  message: {
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s15,
    lineHeight: LINE_HEIGHT.comment,
    color: COLORS.textStrong,
  },
  error: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s13_5,
    color: COLORS.danger,
  },
});
