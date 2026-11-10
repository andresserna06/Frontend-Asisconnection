import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { RegisterCredentials } from '@/modules/auth/domain/AuthService';
import type { RoleCode } from '@/shared/domain/models/RoleCode';
import { BORDER_WIDTH, COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SPACING } from '@/shared/theme';
import { Button } from '@/shared/ui/atoms/Button';
import { TextField } from '@/shared/ui/molecules/TextField';
import { ConsentCheckbox } from './ConsentCheckbox';
import { LOGIN_STRINGS } from '../strings';

type RegisterModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (credentials: RegisterCredentials) => Promise<void>;
  isSubmitting: boolean;
};

const REGISTRATION_ROLES: { code: Exclude<RoleCode, 'MODERATOR' | 'ADMIN'>; label: string }[] = [
  { code: 'ACUDIENTE', label: 'Acudiente' },
  { code: 'VOLUNTARIO', label: 'Voluntario' },
  { code: 'INVERSOR', label: 'Inversor' },
  { code: 'BENEFICIARIO', label: 'Beneficiario' },
];

export function RegisterModal({ visible, onClose, onSubmit, isSubmitting }: RegisterModalProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Exclude<RoleCode, 'MODERATOR' | 'ADMIN'>>('ACUDIENTE');
  const [acceptConsent, setAcceptConsent] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleRegister() {
    if (!username.trim()) {
      setValidationError('Ingresa un nombre de usuario.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setValidationError('Ingresa un correo electrónico válido.');
      return;
    }
    if (password.length < 8) {
      setValidationError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!acceptConsent) {
      setValidationError('Debes aceptar el tratamiento de datos personales.');
      return;
    }

    setValidationError(null);
    try {
      await onSubmit({
        username: username.trim(),
        email: email.trim(),
        password,
        role,
        acceptConsent,
      });
      onClose();
    } catch {
      // Error is set in parent state
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text accessibilityRole="header" style={styles.title}>
              {LOGIN_STRINGS.registerTitle}
            </Text>

            <TextField
              label={LOGIN_STRINGS.usernameLabel}
              placeholder={LOGIN_STRINGS.usernamePlaceholder}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <TextField
              label={LOGIN_STRINGS.emailLabel}
              placeholder={LOGIN_STRINGS.emailPlaceholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextField
              label={LOGIN_STRINGS.passwordLabel}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <View style={styles.roleSection}>
              <Text style={styles.roleLabel}>{LOGIN_STRINGS.roleLabel}</Text>
              <View style={styles.roleChips}>
                {REGISTRATION_ROLES.map((r) => {
                  const isSelected = role === r.code;
                  return (
                    <Pressable
                      key={r.code}
                      onPress={() => setRole(r.code)}
                      style={[styles.roleChip, isSelected && styles.roleChipSelected]}
                    >
                      <Text
                        style={[styles.roleChipText, isSelected && styles.roleChipTextSelected]}
                      >
                        {r.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <ConsentCheckbox
              label={LOGIN_STRINGS.consent}
              isChecked={acceptConsent}
              onToggle={() => setAcceptConsent((c) => !c)}
            />

            {validationError && <Text style={styles.errorText}>{validationError}</Text>}

            <View style={styles.actions}>
              <Button
                label={LOGIN_STRINGS.registerSubmit}
                isLoading={isSubmitting}
                onPress={handleRegister}
              />
              <Button label={LOGIN_STRINGS.registerCancel} variant="outline" onPress={onClose} />
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
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.cardLarge,
    borderTopRightRadius: RADIUS.cardLarge,
    maxHeight: '90%',
    padding: SPACING.s24,
  },
  content: {
    gap: SPACING.s16,
    paddingBottom: SPACING.s28,
  },
  title: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s22,
    color: COLORS.textTitle,
  },
  roleSection: {
    gap: SPACING.s8,
  },
  roleLabel: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s14,
    color: COLORS.text,
  },
  roleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s8,
  },
  roleChip: {
    paddingVertical: SPACING.s6,
    paddingHorizontal: SPACING.s12,
    borderRadius: RADIUS.pill,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  roleChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleChipText: {
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s13,
    color: COLORS.textSecondary,
  },
  roleChipTextSelected: {
    fontFamily: FONT_FAMILY.bodyBold,
    color: COLORS.onPrimary,
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
