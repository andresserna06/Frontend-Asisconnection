import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/modules/auth';
import { COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SIZE, SPACING } from '@/shared/theme';
import { Icon } from '@/shared/ui/atoms/Icon';
import { ToggleRow } from '@/shared/ui/molecules/ToggleRow';
import { ResponsiveScreen } from '@/shared/ui/templates/ResponsiveScreen';
import { usePrivacySettings } from '../application/usePrivacySettings';
import type { SettingsService } from '../domain/SettingsService';
import type { PrivacySettings } from '../domain/models/PrivacySettings';
import { useSettingsService } from '../useSettingsService';
import { SETTINGS_STRINGS } from './strings';

type SettingsScreenProps = {
  initialSettings?: PrivacySettings;
  service?: SettingsService;
};

export function SettingsScreen({
  initialSettings,
  service: serviceOverride,
}: SettingsScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const defaultService = useSettingsService();
  const service = serviceOverride ?? defaultService;
  const { settings, toggleSetting } = usePrivacySettings(initialSettings, service);

  const visibleItems: string[] = [];
  if (settings.showEmail) visibleItems.push(SETTINGS_STRINGS.emailLabel);
  if (settings.showBirthDate) visibleItems.push(SETTINGS_STRINGS.birthDateLabel);
  if (settings.showCity) visibleItems.push(SETTINGS_STRINGS.cityLabel);

  return (
    <ResponsiveScreen>
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
              valueLabel={
                settings.showEmail ? SETTINGS_STRINGS.visibleToCommunity : SETTINGS_STRINGS.onlyMe
              }
              onToggle={() => toggleSetting('showEmail')}
            />
            <ToggleRow
              label={SETTINGS_STRINGS.birthDateLabel}
              isEnabled={settings.showBirthDate}
              valueLabel={
                settings.showBirthDate
                  ? SETTINGS_STRINGS.visibleToCommunity
                  : SETTINGS_STRINGS.onlyMe
              }
              onToggle={() => toggleSetting('showBirthDate')}
            />
            <ToggleRow
              label={SETTINGS_STRINGS.cityLabel}
              isEnabled={settings.showCity}
              valueLabel={
                settings.showCity ? SETTINGS_STRINGS.visibleToCommunity : SETTINGS_STRINGS.onlyMe
              }
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
              valueLabel={
                settings.requireFollowApproval
                  ? SETTINGS_STRINGS.visibleToCommunity
                  : SETTINGS_STRINGS.onlyMe
              }
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
    </ResponsiveScreen>
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
