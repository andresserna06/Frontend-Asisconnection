import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  CONTENT_REPORT_REASONS,
  type ContentReportReason,
  type ContentReportTargetType,
  type CreateContentReportInput,
} from '@/shared/domain/models/ContentReport';
import {
  BORDER_WIDTH,
  COLORS,
  CONTENT_MAX_WIDTH,
  FONT_FAMILY,
  FONT_SIZE,
  OPACITY,
  RADIUS,
  SIZE,
  SPACING,
} from '@/shared/theme';
import { Icon } from '@/shared/ui/atoms/Icon';

export const REPORT_REASON_LABELS: Record<ContentReportReason, string> = {
  INAPPROPRIATE_CONTENT: 'Contenido inapropiado',
  HARASSMENT: 'Acoso o trato irrespetuoso',
  MINOR_PRIVACY: 'Privacidad de menores o datos sensibles',
  SPAM: 'Spam o publicidad',
  OTHER: 'Otro motivo',
};

const REPORT_MODAL_STRINGS = {
  titlePost: 'Reportar publicación',
  titleComment: 'Reportar comentario',
  subtitle: 'Selecciona el motivo para que el equipo de moderación revise este contenido.',
  reasonHeader: 'Motivo del reporte',
  detailsLabel: 'Detalles adicionales (opcional)',
  detailsPlaceholder: 'Describe brevemente por qué reportas este contenido (máx. 500 caracteres)…',
  submit: 'Enviar reporte',
  submitting: 'Enviando…',
  cancel: 'Cancelar',
  close: 'Cerrar modal de reporte',
  doneTitle: 'Reporte enviado',
  doneMessage: 'Gracias por cuidar a la comunidad. El equipo de moderación revisará el contenido.',
  doneAction: 'Entendido',
  conflictError: 'Ya enviaste un reporte abierto para este contenido.',
  genericError: 'No pudimos enviar el reporte. Inténtalo de nuevo.',
} as const;

type ReportContentModalProps = {
  visible: boolean;
  targetType: ContentReportTargetType;
  targetId: string | null;
  onClose: () => void;
  onSubmit: (input: CreateContentReportInput) => Promise<void>;
};

export function ReportContentModal({
  visible,
  targetType,
  targetId,
  onClose,
  onSubmit,
}: ReportContentModalProps) {
  const [selectedReason, setSelectedReason] =
    useState<ContentReportReason>('INAPPROPRIATE_CONTENT');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  function resetAndClose() {
    setSelectedReason('INAPPROPRIATE_CONTENT');
    setDetails('');
    setIsSubmitting(false);
    setErrorMessage(null);
    setIsSubmitted(false);
    onClose();
  }

  async function handleSend() {
    if (!targetId || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const trimmedDetails = details.trim();
      await onSubmit({
        targetType,
        targetId,
        reason: selectedReason,
        ...(trimmedDetails.length > 0 ? { details: trimmedDetails } : {}),
      });
      setIsSubmitted(true);
    } catch (error) {
      if (error instanceof Error && error.message === 'reportConflict') {
        setErrorMessage(REPORT_MODAL_STRINGS.conflictError);
      } else {
        setErrorMessage(REPORT_MODAL_STRINGS.genericError);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const title =
    targetType === 'POST' ? REPORT_MODAL_STRINGS.titlePost : REPORT_MODAL_STRINGS.titleComment;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={resetAndClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>
              {isSubmitted ? REPORT_MODAL_STRINGS.doneTitle : title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={REPORT_MODAL_STRINGS.close}
              onPress={resetAndClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <Icon name="x" size={SIZE.icon} color={COLORS.textSecondary} />
            </Pressable>
          </View>

          {isSubmitted ? (
            <View style={styles.doneContainer}>
              <Text style={styles.subtitle}>{REPORT_MODAL_STRINGS.doneMessage}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={REPORT_MODAL_STRINGS.doneAction}
                onPress={resetAndClose}
                style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}
              >
                <Text style={styles.submitText}>{REPORT_MODAL_STRINGS.doneAction}</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.form}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.subtitle}>{REPORT_MODAL_STRINGS.subtitle}</Text>

              <Text style={styles.fieldLabel}>{REPORT_MODAL_STRINGS.reasonHeader}</Text>
              <View style={styles.reasonsList}>
                {CONTENT_REPORT_REASONS.map((reason) => {
                  const isSelected = selectedReason === reason;
                  const label = REPORT_REASON_LABELS[reason];
                  return (
                    <Pressable
                      key={reason}
                      accessibilityRole="radio"
                      accessibilityLabel={label}
                      accessibilityState={{ checked: isSelected }}
                      onPress={() => {
                        setSelectedReason(reason);
                        setErrorMessage(null);
                      }}
                      style={({ pressed }) => [
                        styles.reasonOption,
                        isSelected && styles.reasonOptionSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.reasonText, isSelected && styles.reasonTextSelected]}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>{REPORT_MODAL_STRINGS.detailsLabel}</Text>
                <TextInput
                  accessibilityLabel={REPORT_MODAL_STRINGS.detailsLabel}
                  value={details}
                  onChangeText={setDetails}
                  placeholder={REPORT_MODAL_STRINGS.detailsPlaceholder}
                  placeholderTextColor={COLORS.textTertiary}
                  maxLength={500}
                  multiline
                  style={styles.textArea}
                />
              </View>

              {errorMessage !== null ? (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {errorMessage}
                </Text>
              ) : null}

              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={REPORT_MODAL_STRINGS.cancel}
                  onPress={resetAndClose}
                  style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
                >
                  <Text style={styles.cancelText}>{REPORT_MODAL_STRINGS.cancel}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={REPORT_MODAL_STRINGS.submit}
                  disabled={isSubmitting}
                  onPress={() => void handleSend()}
                  style={({ pressed }) => [
                    styles.submitButton,
                    (pressed || isSubmitting) && styles.pressed,
                  ]}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={COLORS.onPrimary} />
                  ) : (
                    <Text style={styles.submitText}>{REPORT_MODAL_STRINGS.submit}</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.s16,
    backgroundColor: COLORS.backdrop,
  },
  sheet: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    maxHeight: '90%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.cardLarge,
    padding: SPACING.s20,
    gap: SPACING.s12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s20,
    color: COLORS.textTitle,
  },
  closeButton: {
    width: SIZE.touchTarget,
    height: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14,
    color: COLORS.textSecondary,
  },
  form: {
    gap: SPACING.s12,
    paddingBottom: SPACING.s8,
  },
  reasonsList: {
    gap: SPACING.s8,
  },
  reasonOption: {
    minHeight: SIZE.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: SPACING.s14,
    paddingVertical: SPACING.s10,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    borderRadius: RADIUS.field,
    backgroundColor: COLORS.background,
  },
  reasonOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.secondarySoft,
  },
  reasonText: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s14,
    color: COLORS.textStrong,
  },
  reasonTextSelected: {
    fontFamily: FONT_FAMILY.bodyBold,
    color: COLORS.onSecondarySoft,
  },
  field: {
    gap: SPACING.s6,
  },
  fieldLabel: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s13,
    color: COLORS.textSecondary,
  },
  textArea: {
    minHeight: 84,
    paddingHorizontal: SPACING.s14,
    paddingVertical: SPACING.s10,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.field,
    backgroundColor: COLORS.inputBackground,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14,
    color: COLORS.text,
    textAlignVertical: 'top',
  },
  errorText: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s13,
    color: COLORS.danger,
  },
  doneContainer: {
    gap: SPACING.s16,
    paddingVertical: SPACING.s8,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.s10,
    marginTop: SPACING.s6,
  },
  cancelButton: {
    flex: 1,
    minHeight: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.background,
  },
  cancelText: {
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s14,
    color: COLORS.textSecondary,
  },
  submitButton: {
    flex: 1,
    minHeight: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.s14,
  },
  submitText: {
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s14,
    color: COLORS.onPrimary,
  },
  pressed: {
    opacity: OPACITY.pressed,
  },
});
