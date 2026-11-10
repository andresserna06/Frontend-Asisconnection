import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAssistant } from '@/modules/assistant/application/useAssistant';
import { useAssistantService } from '@/modules/assistant/useAssistantService';
import { useResponsiveLayout } from '@/shared/hooks/useResponsiveLayout';
import { COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SIZE, SPACING } from '@/shared/theme';
import { Icon } from '@/shared/ui/atoms/Icon';
import { ResponsiveScreen } from '@/shared/ui/templates/ResponsiveScreen';
import { ASSISTANT_STRINGS } from './strings';

function showAssistantUnavailable() {
  Alert.alert(ASSISTANT_STRINGS.contentPendingTitle, ASSISTANT_STRINGS.contentPendingMessage);
}

export function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const { isDesktop } = useResponsiveLayout();
  const service = useAssistantService();
  const { disclaimer, faqs, turns, selectOption, reset, escalate } = useAssistant(service);

  const optionLabels =
    faqs.length > 0 ? faqs.map((item) => item.question) : [...ASSISTANT_STRINGS.faqOptions];

  function handleOptionPress(option: string) {
    const matched = selectOption(option);
    if (!matched) {
      showAssistantUnavailable();
    }
  }

  async function handleEscalate() {
    try {
      const link = await escalate();
      await Linking.openURL(link.whatsappUrl);
    } catch {
      showAssistantUnavailable();
    }
  }

  return (
    <ResponsiveScreen>
      <View style={styles.container}>
        <View
          style={[
            styles.header,
            { paddingTop: insets.top + SPACING.s8 },
            isDesktop && styles.desktopHeader,
          ]}
        >
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
            onPress={reset}
            style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
          >
            <Icon name="rotate-ccw" size={SIZE.iconSmall} color={COLORS.textSecondary} />
            <Text style={styles.resetLabel}>{ASSISTANT_STRINGS.reset}</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.conversation}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>{ASSISTANT_STRINGS.greeting}</Text>
          </View>
          <Text style={styles.pendingNote}>{disclaimer ?? ASSISTANT_STRINGS.pendingNote}</Text>

          {turns.map((turn) => (
            <View key={turn.id} style={styles.turnContainer}>
              <View style={styles.userBubble}>
                <Text style={styles.userBubbleText}>{turn.question}</Text>
              </View>
              <View style={styles.greeting}>
                <Text style={styles.greetingText}>{turn.answer}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.optionsPanel}>
          <Text style={styles.sectionLabel}>{ASSISTANT_STRINGS.chooseOption}</Text>
          <View style={styles.options}>
            {optionLabels.map((option, index) => (
              <Pressable
                key={option}
                accessibilityRole="button"
                onPress={() => handleOptionPress(option)}
                style={({ pressed }) => [
                  styles.optionButton,
                  index === optionLabels.length - 1 && styles.fullWidthOption,
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
            onPress={reset}
            style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
          >
            <Icon name="menu" size={SIZE.iconSmall} color={COLORS.textTitle} />
            <Text style={styles.menuLabel}>{ASSISTANT_STRINGS.menu}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={ASSISTANT_STRINGS.talkToPerson}
            onPress={handleEscalate}
            style={({ pressed }) => [styles.humanButton, pressed && styles.pressed]}
          >
            <Icon name="user" size={SIZE.iconSmall} color={COLORS.text} />
            <Text style={styles.humanLabel}>{ASSISTANT_STRINGS.talkToPerson}</Text>
          </Pressable>
        </View>
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
    paddingBottom: SPACING.s12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  desktopHeader: {
    marginTop: SPACING.s16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.cardLarge,
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
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
  },
  resetLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s12,
  },
  conversation: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    gap: SPACING.s12,
    paddingHorizontal: SPACING.s16,
    paddingVertical: SPACING.s16,
  },
  turnContainer: {
    gap: SPACING.s8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    padding: SPACING.s12,
    borderRadius: RADIUS.card,
    borderBottomRightRadius: SPACING.s5,
    backgroundColor: COLORS.primary,
  },
  userBubbleText: {
    color: COLORS.onPrimary,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s14,
  },
  greeting: {
    alignSelf: 'flex-start',
    maxWidth: '92%',
    padding: SPACING.s14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    borderBottomLeftRadius: SPACING.s5,
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
    fontSize: FONT_SIZE.s12_5,
    lineHeight: 18,
  },
  optionsPanel: {
    gap: SPACING.s8,
    paddingHorizontal: SPACING.s16,
    paddingTop: SPACING.s12,
    paddingBottom: SPACING.s10,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s11_5,
    letterSpacing: 0.7,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s8,
  },
  optionButton: {
    width: '48%',
    minHeight: SIZE.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: SPACING.s12,
    paddingVertical: SPACING.s9,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.surface,
  },
  fullWidthOption: {
    width: '100%',
  },
  optionLabel: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s13,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.s8,
    paddingHorizontal: SPACING.s16,
    paddingTop: SPACING.s6,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  menuButton: {
    minHeight: SIZE.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.s6,
    paddingHorizontal: SPACING.s14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.headerButton,
    backgroundColor: COLORS.background,
  },
  menuLabel: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s13,
  },
  humanButton: {
    flex: 1,
    minHeight: SIZE.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.s7,
    paddingHorizontal: SPACING.s14,
    borderRadius: RADIUS.headerButton,
    backgroundColor: COLORS.accent,
  },
  humanLabel: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s13_5,
  },
  pressed: {
    opacity: 0.75,
  },
});
