import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { MyProfile } from '@/modules/profile/domain/models/MyProfile';
import type { UpdateProfileInput } from '@/modules/profile/domain/ProfileService';
import { useResponsiveLayout } from '@/shared/hooks/useResponsiveLayout';
import {
  COLORS,
  CONTENT_MAX_WIDTH,
  DESKTOP_LAYOUT,
  FONT_FAMILY,
  FONT_SIZE,
  RADIUS,
  SPACING,
} from '@/shared/theme';
import { Button } from '@/shared/ui/atoms/Button';
import { TextField } from '@/shared/ui/molecules/TextField';

import { BirthDateField } from './BirthDateField';

type EditProfileModalProps = {
  visible: boolean;
  profile: MyProfile;
  onClose: () => void;
  onSave: (input: UpdateProfileInput) => Promise<void>;
};

function splitFullName(fullName: string): { firstNames: string; lastNames: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstNames: parts[0] ?? '', lastNames: '' };
  }
  return {
    firstNames: parts[0] ?? '',
    lastNames: parts.slice(1).join(' '),
  };
}

export function EditProfileModal({ visible, profile, onClose, onSave }: EditProfileModalProps) {
  const { isDesktop } = useResponsiveLayout();
  const initialNames = splitFullName(profile.fullName);
  const [firstNames, setFirstNames] = useState(initialNames.firstNames);
  const [lastNames, setLastNames] = useState(initialNames.lastNames);
  const [city, setCity] = useState(profile.city ?? '');
  const [birthDate, setBirthDate] = useState(profile.birthDate?.slice(0, 10) ?? '');
  const [shortBio, setShortBio] = useState(profile.shortBio ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      await onSave({
        ...(firstNames.trim() ? { firstNames: firstNames.trim() } : {}),
        lastNames: lastNames.trim(),
        city: city.trim() || undefined,
        birthDate: birthDate || undefined,
        shortBio: shortBio.trim() || undefined,
      });
      onClose();
    } catch {
      setError('No pudimos guardar los cambios. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType={isDesktop ? 'fade' : 'slide'}
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, isDesktop && styles.desktopOverlay]}>
        <View style={[styles.sheet, isDesktop && styles.desktopSheet]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text accessibilityRole="header" style={styles.title}>
              Editar perfil
            </Text>

            <TextField
              label="Nombres"
              placeholder="Tus nombres"
              value={firstNames}
              onChangeText={setFirstNames}
            />

            <TextField
              label="Apellidos"
              placeholder="Tus apellidos"
              value={lastNames}
              onChangeText={setLastNames}
            />

            <TextField
              label="Ciudad"
              placeholder="ej. Manizales"
              value={city}
              onChangeText={setCity}
            />

            <BirthDateField value={birthDate} onChange={setBirthDate} />

            <TextField
              label="Biografía corta"
              placeholder="Cuéntanos un poco sobre ti"
              value={shortBio}
              onChangeText={setShortBio}
              multiline
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.actions}>
              <Button label="Guardar cambios" isLoading={isSaving} onPress={handleSave} />
              <Button label="Cancelar" variant="outline" onPress={onClose} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  desktopOverlay: {
    justifyContent: 'center',
  },
  desktopSheet: {
    maxWidth: DESKTOP_LAYOUT.dialogWidth,
    borderRadius: RADIUS.cardLarge,
  },
  sheet: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.cardLarge,
    borderTopRightRadius: RADIUS.cardLarge,
    maxHeight: '90%',
    padding: SPACING.s24,
  },
  content: {
    gap: SPACING.s14,
    paddingBottom: SPACING.s28,
  },
  title: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s22,
    color: COLORS.textTitle,
  },
  errorText: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s13_5,
    color: COLORS.danger,
  },
  actions: {
    gap: SPACING.s10,
    marginTop: SPACING.s8,
  },
});
