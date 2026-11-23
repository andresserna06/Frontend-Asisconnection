import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { AdminResource } from '@/modules/admin/application/useAdminDashboard';
import type { AdminErrorKind } from '@/modules/admin/domain/models/AdminError';
import type { AdminFaqInput, AdminFaqItem } from '@/modules/admin/domain/models/AdminFaqItem';
import {
  BORDER_WIDTH,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  RADIUS,
  SIZE,
  SPACING,
} from '@/shared/theme';
import { Button } from '@/shared/ui/atoms/Button';
import { Icon } from '@/shared/ui/atoms/Icon';
import { Input } from '@/shared/ui/atoms/Input';
import { TextButton } from '@/shared/ui/atoms/TextButton';
import { ConfirmDialog } from '@/shared/ui/organisms/ConfirmDialog';

import { ADMIN_STRINGS } from '../strings';

type FaqManagementSectionProps = {
  faqs: AdminResource<AdminFaqItem[]>;
  busyFaqId: string | null;
  isSavingFaq: boolean;
  operationError: { kind: AdminErrorKind } | null;
  onCreate: (input: AdminFaqInput) => Promise<boolean>;
  onUpdate: (id: string, input: AdminFaqInput) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onRetry: () => void;
};

export function FaqManagementSection({
  faqs,
  busyFaqId,
  isSavingFaq,
  operationError,
  onCreate,
  onUpdate,
  onDelete,
  onRetry,
}: FaqManagementSectionProps) {
  const [editingFaq, setEditingFaq] = useState<AdminFaqItem | null>(null);
  const [category, setCategory] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [faqToDelete, setFaqToDelete] = useState<AdminFaqItem | null>(null);

  function resetForm() {
    setEditingFaq(null);
    setCategory('');
    setQuestion('');
    setAnswer('');
    setValidationError(null);
  }

  function handleStartEdit(item: AdminFaqItem) {
    setEditingFaq(item);
    setCategory(item.category);
    setQuestion(item.question);
    setAnswer(item.answer);
    setValidationError(null);
  }

  async function handleSubmit() {
    const trimmedCategory = category.trim();
    const trimmedQuestion = question.trim();
    const trimmedAnswer = answer.trim();

    if (!trimmedCategory || !trimmedQuestion || !trimmedAnswer) {
      setValidationError(ADMIN_STRINGS.faqs.validationError);
      return;
    }

    setValidationError(null);
    const payload: AdminFaqInput = {
      category: trimmedCategory,
      question: trimmedQuestion,
      answer: trimmedAnswer,
    };

    const succeeded = editingFaq ? await onUpdate(editingFaq.id, payload) : await onCreate(payload);

    if (succeeded) {
      resetForm();
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {editingFaq ? ADMIN_STRINGS.faqs.editTitle : ADMIN_STRINGS.faqs.createTitle}
        </Text>

        <Input
          accessibilityLabel={ADMIN_STRINGS.faqs.categoryLabel}
          onChangeText={(value) => {
            setCategory(value);
            setValidationError(null);
          }}
          placeholder={ADMIN_STRINGS.faqs.categoryPlaceholder}
          value={category}
        />

        <Input
          accessibilityLabel={ADMIN_STRINGS.faqs.questionLabel}
          onChangeText={(value) => {
            setQuestion(value);
            setValidationError(null);
          }}
          placeholder={ADMIN_STRINGS.faqs.questionPlaceholder}
          value={question}
        />

        <Input
          accessibilityLabel={ADMIN_STRINGS.faqs.answerLabel}
          multiline
          onChangeText={(value) => {
            setAnswer(value);
            setValidationError(null);
          }}
          placeholder={ADMIN_STRINGS.faqs.answerPlaceholder}
          value={answer}
        />

        {validationError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {validationError}
          </Text>
        ) : null}

        <Button
          label={editingFaq ? ADMIN_STRINGS.faqs.updateAction : ADMIN_STRINGS.faqs.createAction}
          onPress={() => void handleSubmit()}
          isLoading={isSavingFaq}
        />

        {editingFaq ? (
          <Button
            label={ADMIN_STRINGS.faqs.cancelEdit}
            variant="outline"
            onPress={resetForm}
            isDisabled={isSavingFaq}
          />
        ) : null}
      </View>

      {operationError !== null ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {ADMIN_STRINGS.errors[operationError.kind] ?? ADMIN_STRINGS.genericError}
        </Text>
      ) : null}

      <View style={styles.listHeading}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {ADMIN_STRINGS.faqs.title}
        </Text>
        {faqs.status === 'success' ? (
          <Text style={styles.secondary}>
            {faqs.data.length} {ADMIN_STRINGS.faqs.count}
          </Text>
        ) : null}
      </View>

      {faqs.status === 'loading' ? (
        <ActivityIndicator
          accessibilityLabel={ADMIN_STRINGS.loading}
          color={COLORS.primary}
          style={styles.status}
        />
      ) : null}

      {faqs.status === 'error' ? (
        <View style={styles.status}>
          <Text accessibilityRole="alert" style={styles.error}>
            {ADMIN_STRINGS.errors[faqs.error.kind] ?? ADMIN_STRINGS.genericError}
          </Text>
          <TextButton label={ADMIN_STRINGS.retry} onPress={onRetry} />
        </View>
      ) : null}

      {faqs.status === 'success' && faqs.data.length === 0 ? (
        <Text style={styles.empty}>{ADMIN_STRINGS.faqs.empty}</Text>
      ) : null}

      {faqs.status === 'success'
        ? faqs.data.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{item.category}</Text>
                </View>
                <Text style={styles.questionText}>{item.question}</Text>
                <Text style={styles.answerText}>{item.answer}</Text>
              </View>
              <View style={styles.actionsColumn}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${ADMIN_STRINGS.faqs.editAction} ${item.question}`}
                  onPress={() => handleStartEdit(item)}
                  style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                >
                  <Icon name="edit-2" size={SIZE.iconSmall} color={COLORS.primary} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${ADMIN_STRINGS.faqs.deleteAction} ${item.question}`}
                  disabled={busyFaqId === item.id}
                  onPress={() => setFaqToDelete(item)}
                  style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
                >
                  {busyFaqId === item.id ? (
                    <ActivityIndicator color={COLORS.danger} />
                  ) : (
                    <Icon name="trash-2" size={SIZE.iconSmall} color={COLORS.danger} />
                  )}
                </Pressable>
              </View>
            </View>
          ))
        : null}

      <ConfirmDialog
        visible={faqToDelete !== null}
        title={ADMIN_STRINGS.faqs.deleteTitle}
        message={ADMIN_STRINGS.faqs.deleteMessage}
        confirmLabel={ADMIN_STRINGS.faqs.deleteAction}
        cancelLabel={ADMIN_STRINGS.cancel}
        onConfirm={() => {
          if (faqToDelete !== null) {
            void onDelete(faqToDelete.id);
          }
          setFaqToDelete(null);
        }}
        onCancel={() => setFaqToDelete(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.s14,
    paddingHorizontal: SPACING.s20,
    paddingBottom: SPACING.s24,
  },
  card: {
    gap: SPACING.s10,
    padding: SPACING.s16,
    backgroundColor: COLORS.surface,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
  },
  sectionTitle: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s16,
  },
  listHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  error: {
    color: COLORS.danger,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14,
    textAlign: 'center',
  },
  status: {
    alignItems: 'center',
    gap: SPACING.s8,
    paddingVertical: SPACING.s20,
  },
  empty: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14,
    textAlign: 'center',
    paddingVertical: SPACING.s20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.s12,
    padding: SPACING.s14,
    backgroundColor: COLORS.surface,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
  },
  itemInfo: {
    flex: 1,
    gap: SPACING.s6,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.s10,
    paddingVertical: SPACING.s2,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.secondarySoft,
  },
  categoryBadgeText: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s12,
  },
  questionText: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s15,
  },
  answerText: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s13_5,
  },
  secondary: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s13,
  },
  actionsColumn: {
    gap: SPACING.s8,
  },
  iconButton: {
    width: SIZE.touchTarget,
    height: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.headerButton,
    backgroundColor: COLORS.secondarySoft,
  },
  deleteButton: {
    width: SIZE.touchTarget,
    height: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.headerButton,
    backgroundColor: COLORS.accentSoft,
  },
  pressed: {
    opacity: 0.7,
  },
});
