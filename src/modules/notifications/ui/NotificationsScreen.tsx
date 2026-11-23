import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/modules/auth';
import { useCollapsingHeader } from '@/shared/hooks/useCollapsingHeader';
import { COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SIZE, SPACING } from '@/shared/theme';
import { Icon } from '@/shared/ui/atoms/Icon';
import { HeaderTeal } from '@/shared/ui/organisms/HeaderTeal';
import { ResponsiveScreen } from '@/shared/ui/templates/ResponsiveScreen';
import { useNotifications } from '../application/useNotifications';
import type { NotificationsService } from '../domain/NotificationsService';
import { NOTIFICATION_PERIODS } from '../domain/models/NotificationItem';
import { useNotificationsService } from '../useNotificationsService';
import { NOTIFICATION_STRINGS } from './strings';

const HEADER_ROW_HEIGHT = 66;

type NotificationsScreenProps = {
  service?: NotificationsService;
};

export function NotificationsScreen({ service: serviceOverride }: NotificationsScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const { isAnonymous } = useAuth();
  const expandedHeaderHeight = insets.top + HEADER_ROW_HEIGHT;
  const { headerHeight, onScroll } = useCollapsingHeader(expandedHeaderHeight);
  const defaultService = useNotificationsService();
  const service = serviceOverride ?? defaultService;
  const { grouped, hasMarkedAllRead, error, markAllRead, reload } = useNotifications(
    service,
    !isAnonymous,
  );

  return (
    <ResponsiveScreen>
      <View style={styles.container}>
        <HeaderTeal
          title={NOTIFICATION_STRINGS.header}
          headerHeight={headerHeight}
          paddingTop={insets.top + SPACING.s8}
          leftAccessory={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={NOTIFICATION_STRINGS.back}
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Icon name="chevron-left" size={SIZE.icon} color={COLORS.onPrimary} />
            </Pressable>
          }
          rightAccessory={
            isAnonymous ? null : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={NOTIFICATION_STRINGS.markRead}
                onPress={() => {
                  void markAllRead();
                }}
                style={({ pressed }) => [styles.readButton, pressed && styles.pressed]}
              >
                <Icon name="check" size={SIZE.iconSmall} color={COLORS.onPrimary} />
                <Text style={styles.readLabel}>
                  {hasMarkedAllRead
                    ? NOTIFICATION_STRINGS.markedRead
                    : NOTIFICATION_STRINGS.markReadShort}
                </Text>
              </Pressable>
            )
          }
        />

        {isAnonymous ? (
          <View style={styles.guestMessage}>
            <Text accessibilityRole="alert" style={styles.guestMessageText}>
              {NOTIFICATION_STRINGS.signInRequired}
            </Text>
          </View>
        ) : error !== null ? (
          <View style={styles.guestMessage}>
            <Text accessibilityRole="alert" style={styles.guestMessageText}>
              {error === 'unauthorized'
                ? NOTIFICATION_STRINGS.unauthorized
                : NOTIFICATION_STRINGS.unavailable}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={reload}
              style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            >
              <Text style={styles.retryLabel}>{NOTIFICATION_STRINGS.retry}</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {NOTIFICATION_PERIODS.map((period) => {
              const periodItems = grouped[period];
              const unreadCount = periodItems.filter((item) => !item.isRead).length;
              return (
                <View key={period} style={styles.period}>
                  <View style={styles.periodHeaderRow}>
                    <Text accessibilityRole="header" style={styles.periodTitle}>
                      {period}
                    </Text>
                    {unreadCount > 0 ? (
                      <Text style={styles.unreadBadge}>
                        {NOTIFICATION_STRINGS.newCount(unreadCount)}
                      </Text>
                    ) : null}
                  </View>
                  {periodItems.length === 0 ? (
                    <View style={styles.emptyPeriod}>
                      <Text style={styles.emptyText}>{NOTIFICATION_STRINGS.empty}</Text>
                    </View>
                  ) : (
                    periodItems.map((item) => {
                      const handlePress = item.postId
                        ? () => router.push(`/comments/${item.postId}`)
                        : item.actorId
                          ? () =>
                              router.push({
                                pathname: '/users/[userId]',
                                params: { userId: item.actorId! },
                              })
                          : undefined;

                      return (
                        <Pressable
                          key={item.id}
                          disabled={!handlePress}
                          onPress={handlePress}
                          style={({ pressed }) => [
                            styles.notificationRow,
                            !item.isRead && styles.unreadRow,
                            pressed && handlePress && styles.pressed,
                          ]}
                        >
                          <View style={styles.notificationMainRow}>
                            <View style={styles.notificationContent}>
                              <Text style={styles.notificationTitle}>{item.title}</Text>
                              <Text style={styles.notificationBody}>{item.body}</Text>
                              {item.snippet ? (
                                <View style={styles.snippetBox}>
                                  <Text style={styles.snippetText} numberOfLines={2}>
                                    {item.snippet}
                                  </Text>
                                </View>
                              ) : null}
                            </View>
                            {!item.isRead ? <View style={styles.unreadDot} /> : null}
                          </View>
                        </Pressable>
                      );
                    })
                  )}
                </View>
              );
            })}
            <Text style={styles.retentionNote}>{NOTIFICATION_STRINGS.retentionNote}</Text>
          </ScrollView>
        )}
      </View>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: SIZE.touchTarget,
    height: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.headerButton,
    backgroundColor: COLORS.headerButton,
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
  guestMessage: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.s24,
  },
  guestMessageText: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s16,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: SPACING.s12,
    paddingHorizontal: SPACING.s20,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.primary,
  },
  retryLabel: {
    color: COLORS.onPrimary,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s14,
  },
  period: {
    marginBottom: SPACING.s14,
  },
  periodHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.s20,
    paddingTop: SPACING.s16,
    paddingBottom: SPACING.s6,
  },
  periodTitle: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s16,
  },
  unreadBadge: {
    overflow: 'hidden',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.s8,
    paddingVertical: SPACING.s2,
    backgroundColor: COLORS.accent,
    color: COLORS.text,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s11_5,
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
  notificationRow: {
    paddingHorizontal: SPACING.s20,
    paddingVertical: SPACING.s12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  notificationMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s12,
  },
  notificationContent: {
    flex: 1,
    gap: SPACING.s4,
  },
  unreadRow: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.accent,
  },
  snippetBox: {
    marginTop: SPACING.s4,
    paddingLeft: SPACING.s10,
    paddingVertical: SPACING.s4,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.small,
  },
  snippetText: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s12_5,
  },
  retentionNote: {
    paddingHorizontal: SPACING.s20,
    paddingTop: SPACING.s8,
    textAlign: 'center',
    color: COLORS.textTertiary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s12,
  },
  notificationTitle: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s14,
  },
  notificationBody: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s13,
  },
});
