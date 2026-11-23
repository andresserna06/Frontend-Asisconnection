import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PROFILE_STRINGS } from '@/modules/profile/ui/strings';
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

type EditPostResult = {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message: string;
};

type EditPostModalProps = {
  visible: boolean;
  initialContent: string;
  onClose: () => void;
  onSave: (content: string) => Promise<EditPostResult>;
  onSaved?: (result: EditPostResult) => void;
};

export function EditPostModal({
  visible,
  initialContent,
  onClose,
  onSave,
  onSaved,
}: EditPostModalProps) {
  const [draft, setDraft] = useState<{ base: string; text: string }>({
    base: initialContent,
    text: initialContent,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<EditPostResult | null>(null);
  const content = draft.base === initialContent ? draft.text : initialContent;

  function handleClose() {
    const completed = submissionResult;
    setDraft({ base: initialContent, text: initialContent });
    setSubmissionResult(null);
    setError(null);
    onClose();
    if (completed) {
      onSaved?.(completed);
    }
  }

  async function handleSave() {
    const trimmed = content.trim();
    if (trimmed.length === 0) {
      setError(PROFILE_STRINGS.postDetail.editModal.emptyError);
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const result = await onSave(trimmed);
      setSubmissionResult(result);
    } catch {
      setError(PROFILE_STRINGS.postDetail.editModal.genericError);
    } finally {
      setIsSaving(false);
    }
  }

  const noticeText =
    submissionResult?.status === 'APPROVED'
      ? PROFILE_STRINGS.postDetail.editModal.approvedNotice
      : submissionResult?.status === 'REJECTED'
        ? PROFILE_STRINGS.postDetail.editModal.rejectedNotice
        : PROFILE_STRINGS.postDetail.editModal.pendingNotice;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>
              {PROFILE_STRINGS.postDetail.editModal.title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={PROFILE_STRINGS.postDetail.editModal.close}
              onPress={handleClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <Icon name="x" size={SIZE.icon} color={COLORS.textSecondary} />
            </Pressable>
          </View>

          {submissionResult !== null ? (
            <View style={styles.noticeContainer}>
              <Text accessibilityRole="alert" style={styles.noticeText}>
                {noticeText}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={PROFILE_STRINGS.postDetail.editModal.doneAction}
                onPress={handleClose}
                style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
              >
                <Text style={styles.saveText}>
                  {PROFILE_STRINGS.postDetail.editModal.doneAction}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.label}>{PROFILE_STRINGS.postDetail.editModal.contentLabel}</Text>
              <TextInput
                accessibilityLabel={PROFILE_STRINGS.postDetail.editModal.contentLabel}
                value={content}
                onChangeText={(value) => {
                  setDraft({ base: initialContent, text: value });
                  setError(null);
                }}
                placeholder={PROFILE_STRINGS.postDetail.editModal.placeholder}
                placeholderTextColor={COLORS.textTertiary}
                multiline
                maxLength={2000}
                style={styles.textArea}
              />

              {error !== null ? (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {error}
                </Text>
              ) : null}

              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={PROFILE_STRINGS.postDetail.editModal.cancel}
                  onPress={handleClose}
                  style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
                >
                  <Text style={styles.cancelText}>
                    {PROFILE_STRINGS.postDetail.editModal.cancel}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={PROFILE_STRINGS.postDetail.editModal.save}
                  disabled={isSaving}
                  onPress={() => void handleSave()}
                  style={({ pressed }) => [
                    styles.saveButton,
                    (pressed || isSaving) && styles.pressed,
                  ]}
                >
                  {isSaving ? (
                    <ActivityIndicator color={COLORS.onPrimary} />
                  ) : (
                    <Text style={styles.saveText}>{PROFILE_STRINGS.postDetail.editModal.save}</Text>
                  )}
                </Pressable>
              </View>
            </View>
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
  form: {
    gap: SPACING.s12,
  },
  label: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s13,
    color: COLORS.textSecondary,
  },
  textArea: {
    minHeight: 110,
    paddingHorizontal: SPACING.s14,
    paddingVertical: SPACING.s10,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.field,
    backgroundColor: COLORS.inputBackground,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s15,
    color: COLORS.text,
    textAlignVertical: 'top',
  },
  errorText: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s13,
    color: COLORS.danger,
  },
  noticeContainer: {
    gap: SPACING.s16,
    paddingVertical: SPACING.s6,
  },
  noticeText: {
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s15,
    color: COLORS.textBody,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.s10,
    marginTop: SPACING.s4,
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
  saveButton: {
    flex: 1,
    minHeight: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.s14,
  },
  saveText: {
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s14,
    color: COLORS.onPrimary,
  },
  pressed: {
    opacity: OPACITY.pressed,
  },
});
