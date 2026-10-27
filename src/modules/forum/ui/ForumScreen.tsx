import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useForumFeed } from '@/modules/forum/application/useForumFeed';
import type { ForumFilter } from '@/modules/forum/domain/models/ForumCategory';
import type { ForumPost } from '@/modules/forum/domain/models/ForumPost';
import { useCollapsingHeader } from '@/shared/hooks/useCollapsingHeader';
import {
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  LETTER_SPACING,
  RADIUS,
  SIZE,
  SPACING,
} from '@/shared/theme';
import { Icon } from '@/shared/ui/atoms/Icon';

import { ForumPostCard } from './components/ForumPostCard';
import { TopicFilters } from './components/TopicFilters';
import { FORUM_STRINGS } from '@/modules/forum/ui/strings';
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from '@/shared/theme';
import { Button } from '@/shared/ui/atoms/Button';

// Placeholder until T-06 builds the forum. "Cerrar sesión" moves to Settings in T-12;
// it is here only so the login flow can be tested end to end.
export function ForumScreen() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [selectedFilter, setSelectedFilter] = useState<ForumFilter>('all');
  const feed = useForumFeed(selectedFilter);
  const expandedHeaderHeight = insets.top + HEADER_ROW_HEIGHT;
  const { headerHeight, onScroll: handleScroll } = useCollapsingHeader(expandedHeaderHeight);
  const postHeight = Math.max(
    0,
    (windowHeight - expandedHeaderHeight - FILTER_BAR_HEIGHT - insets.bottom) * 0.82,
  );

  const renderPost = useCallback(
    ({ item }: { item: ForumPost }) => (
      <View style={[styles.postFrame, { height: postHeight }]}>
        <ForumPostCard post={item} />
      </View>
    ),
    [postHeight],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Text accessibilityRole="header" style={styles.title}>
        {FORUM_STRINGS.greeting(user?.username ?? '')}
      </Text>
      {user && <RoleBadge roles={user.roles} size="medium" />}
      <Text style={styles.body}>{FORUM_STRINGS.comingSoon}</Text>
      <Button label={FORUM_STRINGS.signOut} variant="outline" onPress={signOut} />
    </View>
  );
}

type FeedStateProps = {
  feed: ReturnType<typeof useForumFeed>;
};

function FeedState({ feed }: FeedStateProps) {
  if (feed.status === 'loading') {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator color={COLORS.primary} accessibilityLabel={FORUM_STRINGS.loading} />
        <Text style={styles.stateMessage}>{FORUM_STRINGS.loading}</Text>
      </View>
    );
  }

  if (feed.status === 'error') {
    return (
      <View style={styles.stateContainer}>
        <Text accessibilityRole="header" style={styles.stateTitle}>
          {FORUM_STRINGS.errorTitle}
        </Text>
        <Text style={styles.stateMessage}>{errorMessage(feed.error)}</Text>
        {feed.error.message !== 'sessionExpired' && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={FORUM_STRINGS.retry}
            onPress={feed.retry}
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
          >
            <Text style={styles.retryLabel}>{FORUM_STRINGS.retry}</Text>
          </Pressable>
        )}
      </View>
    );
  }

  if (feed.status === 'unavailable') {
    return (
      <View style={styles.stateContainer}>
        <Text accessibilityRole="header" style={styles.stateTitle}>
          {FORUM_STRINGS.unavailableTitle}
        </Text>
        <Text style={styles.stateMessage}>{FORUM_STRINGS.unavailableMessage}</Text>
      </View>
    );
  }

  if (feed.posts.length === 0) {
    return (
      <View style={styles.stateContainer}>
        <Text accessibilityRole="header" style={styles.stateTitle}>
          {FORUM_STRINGS.emptyTitle}
        </Text>
        <Text style={styles.stateMessage}>{FORUM_STRINGS.emptyMessage}</Text>
      </View>
    );
  }

  return null;
}

function errorMessage(error: Error): string {
  if (error.message === 'sessionExpired') {
    return FORUM_STRINGS.sessionExpired;
  }
  if (error.message === 'forbidden') {
    return FORUM_STRINGS.forbidden;
  }
  return FORUM_STRINGS.connectionError;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerClip: {
    overflow: 'hidden',
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
  headerButton: {
    width: SIZE.touchTarget,
    height: SIZE.touchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.headerButton,
  },
  createButton: {
    backgroundColor: COLORS.accent,
  },
  notificationButton: {
    backgroundColor: COLORS.headerButton,
  },
  pressed: {
    opacity: 0.75,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s20,
    letterSpacing: LETTER_SPACING.wide / 4,
    color: COLORS.onPrimary,
  },
  feedContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.s16,
    paddingTop: SPACING.s16,
  },
  postFrame: {
    width: '100%',
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.s10,
    paddingHorizontal: SPACING.s24,
  },
  stateTitle: {
    textAlign: 'center',
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s20,
    color: COLORS.textTitle,
  },
  stateMessage: {
    textAlign: 'center',
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s15,
    color: COLORS.textSecondary,
  },
  retryButton: {
    minHeight: SIZE.touchTarget,
    justifyContent: 'center',
    borderRadius: RADIUS.button,
    paddingHorizontal: SPACING.s16,
    backgroundColor: COLORS.primary,
  },
  retryLabel: {
    color: COLORS.onPrimary,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s15,
  },
});
