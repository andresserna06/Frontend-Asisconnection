import { Alert, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SIZE, SPACING } from '@/shared/theme';
import { Icon } from '@/shared/ui/atoms/Icon';
import { useCollapsingHeader } from '@/shared/hooks/useCollapsingHeader';
import { NOTIFICATION_STRINGS } from './strings';

const HEADER_ROW_HEIGHT = 66;

export function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const expandedHeaderHeight = insets.top + HEADER_ROW_HEIGHT;
  const { headerHeight, onScroll } = useCollapsingHeader(expandedHeaderHeight);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.headerClip, { height: headerHeight }]}>
        <View style={[styles.header, { paddingTop: insets.top + SPACING.s8 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={NOTIFICATION_STRINGS.back}
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Icon name="chevron-left" size={SIZE.icon} color={COLORS.onPrimary} />
          </Pressable>
          <Text accessibilityRole="header" numberOfLines={1} style={styles.title}>
            {NOTIFICATION_STRINGS.header}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={NOTIFICATION_STRINGS.markRead}
            onPress={() =>
              Alert.alert(
                NOTIFICATION_STRINGS.markUnavailableTitle,
                NOTIFICATION_STRINGS.markUnavailableMessage,
              )
            }
            style={({ pressed }) => [styles.readButton, pressed && styles.pressed]}
          >
            <Icon name="check" size={SIZE.iconSmall} color={COLORS.onPrimary} />
            <Text style={styles.readLabel}>{NOTIFICATION_STRINGS.markReadShort}</Text>
          </Pressable>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {NOTIFICATION_STRINGS.periods.map((period) => (
          <View key={period} style={styles.period}>
            <Text accessibilityRole="header" style={styles.periodTitle}>
              {period}
            </Text>
            <View style={styles.emptyPeriod}>
              <Text style={styles.emptyText}> {NOTIFICATION_STRINGS.empty}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerClip: {
    overflow: 'hidden',
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
  title: {
    flex: 1,
    color: COLORS.onPrimary,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s21,
  },
  readButton: {
    minHeight: SIZE.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.s5,
    paddingHorizontal: SPACING.s12,
    borderRadius: RADIUS.headerButton,
    backgroundColor: COLORS.headerButton,
  },
  readLabel: {
    color: COLORS.onPrimary,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s12_5,
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    paddingTop: SPACING.s6,
    paddingBottom: SPACING.s16,
  },
  period: {
    marginBottom: SPACING.s14,
  },
  periodTitle: {
    paddingHorizontal: SPACING.s20,
    paddingTop: SPACING.s16,
    paddingBottom: SPACING.s6,
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s16,
  },
  emptyPeriod: {
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: SPACING.s20,
    paddingVertical: SPACING.s12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14,
  },
});
