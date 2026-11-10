import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/modules/auth';
import {
  BORDER_WIDTH,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  LINE_HEIGHT,
  RADIUS,
  SIZE,
  SPACING,
} from '@/shared/theme';
import { Icon } from '@/shared/ui/atoms/Icon';
import { TextButton } from '@/shared/ui/atoms/TextButton';

import { useNotifications } from '../../application/useNotifications';
import { NOTIFICATION_PERIODS } from '../../domain/models/NotificationItem';
import { useNotificationsService } from '../../useNotificationsService';
import { NOTIFICATION_STRINGS } from '../strings';

const MAX_RECENT_NOTIFICATIONS = 5;
const UNREAD_DOT_SIZE = 8;

// Latest notifications for the desktop side panel of the forum.
export function NotificationsPanel() {
  const { isAnonymous } = useAuth();
  const service = useNotificationsService();
  const { grouped, isLoading, error, reload } = useNotifications(service, !isAnonymous);
  const hasBeenFocused = useRef(false);
  const recent = NOTIFICATION_PERIODS.flatMap((period) => grouped[period]).slice(
    0,
    MAX_RECENT_NOTIFICATIONS,
  );

  // Coming back from the full list, the read state may have changed.
  useFocusEffect(
    useCallback(() => {
      if (!hasBeenFocused.current) {
        hasBeenFocused.current = true;
        return;
      }
      reload();
    }, [reload]),
  );

  let content;
  if (isAnonymous) {
    content = <Text style={styles.message}>{NOTIFICATION_STRINGS.signInRequired}</Text>;
  } else if (isLoading) {
    content = (
      <ActivityIndicator
        color={COLORS.primary}
        accessibilityLabel={NOTIFICATION_STRINGS.loading}
        style={styles.loading}
      />
    );
  } else if (error !== null) {
    content = (
      <>
        <Text accessibilityRole="alert" style={styles.message}>
          {error === 'unauthorized'
            ? NOTIFICATION_STRINGS.unauthorized
            : NOTIFICATION_STRINGS.unavailable}
        </Text>
        <TextButton label={NOTIFICATION_STRINGS.retry} size="small" onPress={reload} />
      </>
    );
  } else if (recent.length === 0) {
    content = <Text style={styles.message}>{NOTIFICATION_STRINGS.recentEmpty}</Text>;
  } else {
    content = recent.map((item) => (
      <View
        key={item.id}
        accessible
        accessibilityLabel={`${item.isRead ? '' : `${NOTIFICATION_STRINGS.unread}. `}${item.title}. ${item.body}`}
        style={styles.row}
      >
        <View style={[styles.dot, !item.isRead && styles.unreadDot]} />
        <View style={styles.copy}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text numberOfLines={2} style={styles.itemBody}>
            {item.body}
          </Text>
        </View>
      </View>
    ));
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name="bell" size={SIZE.icon} color={COLORS.primary} />
        <Text accessibilityRole="header" style={styles.title}>
          {NOTIFICATION_STRINGS.header}
        </Text>
        {!isAnonymous && (
          <TextButton
            label={NOTIFICATION_STRINGS.seeAll}
            size="small"
            onPress={() => router.push('/notifications')}
          />
        )}
      </View>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: SPACING.s8,
    padding: SPACING.s16,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    borderRadius: RADIUS.cardLarge,
    backgroundColor: COLORS.surface,
  },
  header: {
    minHeight: SIZE.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s8,
  },
  title: {
    flex: 1,
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s18,
  },
  loading: {
    paddingVertical: SPACING.s16,
  },
  message: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14,
    lineHeight: LINE_HEIGHT.body,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.s10,
    paddingVertical: SPACING.s8,
    borderTopWidth: BORDER_WIDTH.hairline,
    borderTopColor: COLORS.surfaceMuted,
  },
  dot: {
    width: UNREAD_DOT_SIZE,
    height: UNREAD_DOT_SIZE,
    marginTop: SPACING.s6,
    borderRadius: RADIUS.pill,
  },
  unreadDot: {
    backgroundColor: COLORS.accent,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: SPACING.s2,
  },
  itemTitle: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s14,
  },
  itemBody: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s13_5,
  },
});
