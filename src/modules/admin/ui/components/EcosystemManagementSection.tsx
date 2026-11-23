import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { AdminResource } from '@/modules/admin/application/useAdminDashboard';
import type {
  AdminEcosystemLink,
  AdminEcosystemLinkInput,
} from '@/modules/admin/domain/models/AdminEcosystemLink';
import type { AdminErrorKind } from '@/modules/admin/domain/models/AdminError';
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

type EcosystemManagementSectionProps = {
  links: AdminResource<AdminEcosystemLink[]>;
  busyLinkId: string | null;
  isSavingLink: boolean;
  operationError: { kind: AdminErrorKind } | null;
  onCreate: (input: AdminEcosystemLinkInput) => Promise<boolean>;
  onUpdate: (id: string, input: AdminEcosystemLinkInput) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onRetry: () => void;
};

export function EcosystemManagementSection({
  links,
  busyLinkId,
  isSavingLink,
  operationError,
  onCreate,
  onUpdate,
  onDelete,
  onRetry,
}: EcosystemManagementSectionProps) {
  const [editingLink, setEditingLink] = useState<AdminEcosystemLink | null>(null);
  const [projectName, setProjectName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [linkToDelete, setLinkToDelete] = useState<AdminEcosystemLink | null>(null);

  function resetForm() {
    setEditingLink(null);
    setProjectName('');
    setUrl('');
    setDescription('');
    setValidationError(null);
  }

  function handleStartEdit(item: AdminEcosystemLink) {
    setEditingLink(item);
    setProjectName(item.projectName);
    setUrl(item.url);
    setDescription(item.description);
    setValidationError(null);
  }

  async function handleSubmit() {
    const trimmedProjectName = projectName.trim();
    const trimmedUrl = url.trim();
    const trimmedDescription = description.trim();
    const isValidUrl = /^https?:\/\/.+/i.test(trimmedUrl);

    if (!trimmedProjectName || !isValidUrl || !trimmedDescription) {
      setValidationError(ADMIN_STRINGS.ecosystem.validationError);
      return;
    }

    setValidationError(null);
    const payload: AdminEcosystemLinkInput = {
      projectName: trimmedProjectName,
      url: trimmedUrl,
      description: trimmedDescription,
    };

    const succeeded = editingLink
      ? await onUpdate(editingLink.id, payload)
      : await onCreate(payload);

    if (succeeded) {
      resetForm();
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {editingLink ? ADMIN_STRINGS.ecosystem.editTitle : ADMIN_STRINGS.ecosystem.createTitle}
        </Text>

        <Input
          accessibilityLabel={ADMIN_STRINGS.ecosystem.projectNameLabel}
          onChangeText={(value) => {
            setProjectName(value);
            setValidationError(null);
          }}
          placeholder={ADMIN_STRINGS.ecosystem.projectNamePlaceholder}
          value={projectName}
        />

        <Input
          accessibilityLabel={ADMIN_STRINGS.ecosystem.urlLabel}
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={(value) => {
            setUrl(value);
            setValidationError(null);
          }}
          placeholder={ADMIN_STRINGS.ecosystem.urlPlaceholder}
          value={url}
        />

        <Input
          accessibilityLabel={ADMIN_STRINGS.ecosystem.descriptionLabel}
          multiline
          onChangeText={(value) => {
            setDescription(value);
            setValidationError(null);
          }}
          placeholder={ADMIN_STRINGS.ecosystem.descriptionPlaceholder}
          value={description}
        />

        {validationError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {validationError}
          </Text>
        ) : null}

        <Button
          label={
            editingLink
              ? ADMIN_STRINGS.ecosystem.updateAction
              : ADMIN_STRINGS.ecosystem.createAction
          }
          onPress={() => void handleSubmit()}
          isLoading={isSavingLink}
        />

        {editingLink ? (
          <Button
            label={ADMIN_STRINGS.ecosystem.cancelEdit}
            variant="outline"
            onPress={resetForm}
            isDisabled={isSavingLink}
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
          {ADMIN_STRINGS.ecosystem.title}
        </Text>
        {links.status === 'success' ? (
          <Text style={styles.secondary}>
            {links.data.length} {ADMIN_STRINGS.ecosystem.count}
          </Text>
        ) : null}
      </View>

      {links.status === 'loading' ? (
        <ActivityIndicator
          accessibilityLabel={ADMIN_STRINGS.loading}
          color={COLORS.primary}
          style={styles.status}
        />
      ) : null}

      {links.status === 'error' ? (
        <View style={styles.status}>
          <Text accessibilityRole="alert" style={styles.error}>
            {ADMIN_STRINGS.errors[links.error.kind] ?? ADMIN_STRINGS.genericError}
          </Text>
          <TextButton label={ADMIN_STRINGS.retry} onPress={onRetry} />
        </View>
      ) : null}

      {links.status === 'success' && links.data.length === 0 ? (
        <Text style={styles.empty}>{ADMIN_STRINGS.ecosystem.empty}</Text>
      ) : null}

      {links.status === 'success'
        ? links.data.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <Text style={styles.projectName}>{item.projectName}</Text>
                <Text style={styles.urlText}>{item.url}</Text>
                <Text style={styles.descriptionText}>{item.description}</Text>
              </View>
              <View style={styles.actionsColumn}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${ADMIN_STRINGS.ecosystem.editAction} ${item.projectName}`}
                  onPress={() => handleStartEdit(item)}
                  style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                >
                  <Icon name="edit-2" size={SIZE.iconSmall} color={COLORS.primary} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${ADMIN_STRINGS.ecosystem.deleteAction} ${item.projectName}`}
                  disabled={busyLinkId === item.id}
                  onPress={() => setLinkToDelete(item)}
                  style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
                >
                  {busyLinkId === item.id ? (
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
        visible={linkToDelete !== null}
        title={ADMIN_STRINGS.ecosystem.deleteTitle}
        message={ADMIN_STRINGS.ecosystem.deleteMessage}
        confirmLabel={ADMIN_STRINGS.ecosystem.deleteAction}
        cancelLabel={ADMIN_STRINGS.cancel}
        onConfirm={() => {
          if (linkToDelete !== null) {
            void onDelete(linkToDelete.id);
          }
          setLinkToDelete(null);
        }}
        onCancel={() => setLinkToDelete(null)}
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
    gap: SPACING.s4,
  },
  projectName: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s15,
  },
  urlText: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s13,
  },
  descriptionText: {
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
