import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useAuth } from '@/modules/auth';
import { COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SIZE, SPACING } from '@/shared/theme';
import { Icon } from '@/shared/ui/atoms/Icon';
import { usePrivacySettings } from '../application/usePrivacySettings';
import type { PrivacySettings } from '../domain/models/PrivacySettings';
import { SETTINGS_STRINGS } from './strings';

type ToggleRowProps = {
  label: string;
  isEnabled: boolean;
  onToggle: () => void;
};

function ToggleRow({ label, isEnabled, onToggle }: ToggleRowProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: isEnabled }}
      onPress={onToggle}
      style={styles.toggleRow}
    >
      <View style={styles.toggleTextColumn}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleState}>
          {isEnabled ? SETTINGS_STRINGS.visibleToCommunity : SETTINGS_STRINGS.onlyMe}
        </Text>
      </View>
      <Switch
        value={isEnabled}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.border, true: COLORS.primary }}
      />
    </Pressable>
  );
}

type SettingsScreenProps = {
  initialSettings?: PrivacySettings;
};

export function SettingsScreen({ initialSettings }: SettingsScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { settings, toggleSetting } = usePrivacySettings(initialSettings);

  const visibleItems: string[] = [];
  if (settings.showEmail) visibleItems.push(SETTINGS_STRINGS.emailLabel);
  if (settings.showBirthDate) visibleItems.push(SETTINGS_STRINGS.birthDateLabel);
  if (settings.showCity) visibleItems.push(SETTINGS_STRINGS.cityLabel);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.s8 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={SETTINGS_STRINGS.back}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Icon name="chevron-left" size={SIZE.icon} color={COLORS.onPrimary} />
        </Pressable>
        <Text accessibilityRole="header" style={styles.headerTitle}>
          {SETTINGS_STRINGS.header}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {SETTINGS_STRINGS.previewTitle}
          </Text>
          <Text style={styles.previewText}>
            {visibleItems.length === 0
              ? SETTINGS_STRINGS.previewEmpty
              : `${SETTINGS_STRINGS.visibleToCommunity}: ${visibleItems.join(', ')}`}
          </Text>
        </View>

        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {SETTINGS_STRINGS.visibilityTitle}
          </Text>
          <ToggleRow
            label={SETTINGS_STRINGS.emailLabel}
            isEnabled={settings.showEmail}
            onToggle={() => toggleSetting('showEmail')}
          />
          <ToggleRow
            label={SETTINGS_STRINGS.birthDateLabel}
            isEnabled={settings.showBirthDate}
            onToggle={() => toggleSetting('showBirthDate')}
          />
          <ToggleRow
            label={SETTINGS_STRINGS.cityLabel}
            isEnabled={settings.showCity}
            onToggle={() => toggleSetting('showCity')}
          />
        </View>

        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {SETTINGS_STRINGS.followTitle}
          </Text>
          <ToggleRow
            label={SETTINGS_STRINGS.requireApprovalLabel}
            isEnabled={settings.requireFollowApproval}
            onToggle={() => toggleSetting('requireFollowApproval')}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={SETTINGS_STRINGS.signOut}
          onPress={() => {
            void signOut();
          }}
          style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}
        >
          <Text style={styles.signOutText}>{SETTINGS_STRINGS.signOut}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s10,
    paddingHorizontal: SPACING.s16,
    paddingBottom: SPACING.s14,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: RADIUS.cardLarge,
    borderBottomRightRadius: RADIUS.cardLarge,
  },
  backButton: {
    width: SIZE.touchTarget,
    height: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.headerButton,
    backgroundColor: COLORS.headerButton,
  },
  headerTitle: {
    flex: 1,
    color: COLORS.onPrimary,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s21,
  },
  content: {
    padding: SPACING.s20,
    gap: SPACING.s16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.s16,
    gap: SPACING.s12,
  },
  sectionTitle: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s16,
  },
  previewText: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: SIZE.touchTarget,
    gap: SPACING.s12,
  },
  toggleTextColumn: {
    flex: 1,
    gap: SPACING.s2,
  },
  toggleLabel: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s14,
  },
  toggleState: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s12,
  },
  signOutButton: {
    minHeight: SIZE.touchTarget,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.s12,
  },
  signOutText: {
    color: COLORS.onPrimary,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s15,
  },
  pressed: {
    opacity: 0.8,
  },
});
