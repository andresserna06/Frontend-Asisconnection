import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SIZE, SPACING } from '@/shared/theme';
import { Icon } from '@/shared/ui/atoms/Icon';
import { ASSISTANT_STRINGS } from './strings';

function showAssistantUnavailable() {
  Alert.alert(ASSISTANT_STRINGS.contentPendingTitle, ASSISTANT_STRINGS.contentPendingMessage);
}

export function AssistantScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.s8 }]}>
        <View style={styles.assistantAvatar}>
          <Icon name="message-circle" size={SIZE.icon} color={COLORS.onPrimary} />
        </View>
        <View style={styles.headerText}>
          <Text accessibilityRole="header" style={styles.title}>
            {ASSISTANT_STRINGS.title}
          </Text>
          <Text style={styles.subtitle}>{ASSISTANT_STRINGS.subtitle}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ASSISTANT_STRINGS.resetLabel}
          onPress={showAssistantUnavailable}
          style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
        >
          <Icon name="rotate-ccw" size={SIZE.iconSmall} color={COLORS.textSecondary} />
          <Text style={styles.resetLabel}>{ASSISTANT_STRINGS.reset}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.conversation} showsVerticalScrollIndicator={false}>
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>{ASSISTANT_STRINGS.greeting}</Text>
        </View>
        <Text style={styles.pendingNote}>{ASSISTANT_STRINGS.pendingNote}</Text>
      </ScrollView>

      <View style={styles.optionsPanel}>
        <Text style={styles.sectionLabel}>{ASSISTANT_STRINGS.chooseOption}</Text>
        <View style={styles.options}>
          {ASSISTANT_STRINGS.faqOptions.map((option, index) => (
            <Pressable
              key={option}
              accessibilityRole="button"
              onPress={showAssistantUnavailable}
              style={({ pressed }) => [
                styles.optionButton,
                index === ASSISTANT_STRINGS.faqOptions.length - 1 && styles.fullWidthOption,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.optionLabel}>{option}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.actions, { paddingBottom: SPACING.s10 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ASSISTANT_STRINGS.menuLabel}
          onPress={showAssistantUnavailable}
          style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
        >
          <Icon name="menu" size={SIZE.iconSmall} color={COLORS.textTitle} />
          <Text style={styles.menuLabel}>{ASSISTANT_STRINGS.menu}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ASSISTANT_STRINGS.talkToPerson}
          onPress={showAssistantUnavailable}
          style={({ pressed }) => [styles.humanButton, pressed && styles.pressed]}
        >
          <Icon name="user" size={SIZE.iconSmall} color={COLORS.text} />
          <Text style={styles.humanLabel}>{ASSISTANT_STRINGS.talkToPerson}</Text>
        </Pressable>
      </View>
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
    paddingBottom: SPACING.s12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  assistantAvatar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primary,
  },
  headerText: {
    flex: 1,
    gap: SPACING.s1,
  },
  title: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s17,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s12,
  },
  resetButton: {
    minHeight: SIZE.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s5,
    paddingHorizontal: SPACING.s10,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.background,
  },
  resetLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s12_5,
  },
  conversation: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    gap: SPACING.s10,
    padding: SPACING.s18,
  },
  greeting: {
    maxWidth: 296,
    padding: SPACING.s14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    borderBottomLeftRadius: RADIUS.small,
    backgroundColor: COLORS.surface,
  },
  greetingText: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14_5,
    lineHeight: 21,
  },
  pendingNote: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s12,
  },
  optionsPanel: {
    gap: SPACING.s8,
    paddingVertical: SPACING.s10,
    backgroundColor: COLORS.secondarySoft,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondaryBorder,
  },
  sectionLabel: {
    paddingHorizontal: SPACING.s16,
    color: COLORS.onSecondarySoft,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s11_5,
    letterSpacing: 0.8,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s8,
    paddingHorizontal: SPACING.s16,
  },
  optionButton: {
    flexBasis: '45%',
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.s12,
    paddingVertical: SPACING.s8,
    borderWidth: 1.5,
    borderColor: COLORS.secondaryBorder,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
  },
  fullWidthOption: {
    flexBasis: '100%',
  },
  optionLabel: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s14,
    lineHeight: 18,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s10,
    paddingHorizontal: SPACING.s16,
    paddingTop: SPACING.s10,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  menuButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s7,
    paddingHorizontal: SPACING.s16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
  },
  menuLabel: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.headingBold,
    fontSize: FONT_SIZE.s14,
  },
  humanButton: {
    flex: 1,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.s8,
    paddingHorizontal: SPACING.s12,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.accent,
  },
  humanLabel: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s14_5,
  },
  pressed: {
    opacity: 0.7,
  },
});
