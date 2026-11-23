import { router } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useForumFeed,
  useReportPost,
  useTogglePostBookmark,
  useTogglePostLike,
} from '@/modules/forum/application/useForumFeed';
import type { ForumFeedMode } from '@/modules/forum/domain/ForumRepository';
import type { ForumFilter } from '@/modules/forum/domain/models/ForumCategory';
import type { ForumPost } from '@/modules/forum/domain/models/ForumPost';
import { useContentRemoval } from '@/modules/removal';
import { STRINGS } from '@/shared/config/strings';
import { useCollapsingHeader } from '@/shared/hooks/useCollapsingHeader';
import { useResponsiveLayout } from '@/shared/hooks/useResponsiveLayout';
import {
  BORDER_WIDTH,
  COLORS,
  DESKTOP_LAYOUT,
  FONT_FAMILY,
  FONT_SIZE,
  LETTER_SPACING,
  RADIUS,
  SIZE,
  SPACING,
  TABLET_MIN_WIDTH,
} from '@/shared/theme';
import { Icon } from '@/shared/ui/atoms/Icon';
import { HeaderTeal } from '@/shared/ui/organisms/HeaderTeal';
import { ReportContentModal } from '@/shared/ui/organisms/ReportContentModal';
import { ResponsiveScreen } from '@/shared/ui/templates/ResponsiveScreen';

import { ForumPostCard } from './components/ForumPostCard';
import { TopicFilters } from './components/TopicFilters';

import { FORUM_STRINGS } from './strings';

const HEADER_ROW_HEIGHT = 58;
const FILTER_BAR_HEIGHT = 61;
const POST_GAP = SPACING.s12;

type ForumScreenProps = {
  aside?: ReactNode;
};

export function ForumScreen({ aside }: ForumScreenProps) {
  const insets = useSafeAreaInsets();
  const { isDesktop, hasAside } = useResponsiveLayout();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const [selectedFilter, setSelectedFilter] = useState<ForumFilter>('all');
  const [selectedFeed, setSelectedFeed] = useState<ForumFeedMode>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const feedOptions =
    selectedFeed !== 'discover' || searchQuery.trim().length > 0
      ? { feed: selectedFeed, search: searchQuery }
      : undefined;
  const feed = useForumFeed(selectedFilter, feedOptions);
  const togglePostLike = useTogglePostLike();
  const togglePostBookmark = useTogglePostBookmark();
  const reportPost = useReportPost();
  const { isHidden } = useContentRemoval();
  const visiblePosts =
    feed.status === 'success' ? feed.posts.filter((post) => !isHidden(post.id)) : [];
  const expandedHeaderHeight = insets.top + HEADER_ROW_HEIGHT;
  const { headerHeight, onScroll: handleScroll } = useCollapsingHeader(expandedHeaderHeight);
  const availablePostHeight =
    (windowHeight - expandedHeaderHeight - FILTER_BAR_HEIGHT - insets.bottom) * 0.82;
  const postHeight = Math.max(
    0,
    windowWidth >= TABLET_MIN_WIDTH ? Math.min(availablePostHeight, 620) : availablePostHeight,
  );

  const renderPost = useCallback(
    ({ item }: { item: ForumPost }) => {
      const profileId = item.author.profileId;

      return (
        <View style={[styles.postFrame, !isDesktop && { height: postHeight }]}>
          <ForumPostCard
            post={item}
            isAutoHeight={isDesktop}
            onCommentsPress={() => router.push(`/comments/${item.id}`)}
            onAuthorPress={
              profileId
                ? () => router.push({ pathname: '/users/[userId]', params: { userId: profileId } })
                : undefined
            }
            onLikePress={() => togglePostLike(item.id)}
            onBookmarkPress={() => togglePostBookmark(item.id)}
            onReportPress={() => setReportingPostId(item.id)}
          />
        </View>
      );
    },
    [isDesktop, postHeight, togglePostBookmark, togglePostLike],
  );

  return (
    <ResponsiveScreen aside={aside} desktopWidth={DESKTOP_LAYOUT.feedWidth}>
      <HeaderTeal
        title={isDesktop ? STRINGS.navigation.forums : FORUM_STRINGS.title}
        headerHeight={headerHeight}
        paddingTop={insets.top}
        titleStyle={{ fontSize: FONT_SIZE.s20, letterSpacing: LETTER_SPACING.wide / 4 }}
        leftAccessory={
          isDesktop ? null : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={FORUM_STRINGS.createPost}
              onPress={() => router.push('/posts/new')}
              style={({ pressed }) => [
                styles.headerButton,
                styles.createButton,
                pressed && styles.pressed,
              ]}
            >
              <Icon name="plus" size={SIZE.icon} color={COLORS.text} />
            </Pressable>
          )
        }
        rightAccessory={
          hasAside ? null : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={FORUM_STRINGS.notifications}
              onPress={() => router.push('/notifications')}
              style={({ pressed }) => [
                styles.headerButton,
                styles.notificationButton,
                pressed && styles.pressed,
              ]}
            >
              <Icon name="bell" size={SIZE.icon} color={COLORS.onPrimary} />
            </Pressable>
          )
        }
      />

      <View style={styles.feedControls}>
        <View style={styles.feedModeTabs}>
          {(['discover', 'following'] as const).map((mode) => {
            const isSelected = selectedFeed === mode;
            const label = FORUM_STRINGS.feedModes[mode];
            return (
              <Pressable
                key={mode}
                accessibilityRole="tab"
                accessibilityLabel={label}
                accessibilityState={{ selected: isSelected }}
                onPress={() => setSelectedFeed(mode)}
                style={({ pressed }) => [
                  styles.feedModeTab,
                  isSelected && styles.feedModeTabActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.feedModeText, isSelected && styles.feedModeTextActive]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.searchBar}>
          <Icon name="search" size={SIZE.iconSmall} color={COLORS.textTertiary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={FORUM_STRINGS.searchPlaceholder}
            placeholderTextColor={COLORS.textTertiary}
            accessibilityLabel={FORUM_STRINGS.searchLabel}
            returnKeyType="search"
            style={styles.searchInput}
          />
          {searchQuery.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={FORUM_STRINGS.clearSearch}
              onPress={() => setSearchQuery('')}
              style={({ pressed }) => [styles.clearSearchButton, pressed && styles.pressed]}
            >
              <Icon name="x" size={SIZE.iconTiny} color={COLORS.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <TopicFilters selected={selectedFilter} onSelect={setSelectedFilter} />

      <FlatList
        data={visiblePosts}
        keyExtractor={(post) => post.id}
        renderItem={renderPost}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={isDesktop ? undefined : postHeight + POST_GAP}
        snapToAlignment="start"
        decelerationRate={isDesktop ? undefined : 'fast'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.feedContent,
          isDesktop && styles.desktopFeedContent,
          { paddingBottom: insets.bottom + SPACING.s16 },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: POST_GAP }} />}
        refreshing={feed.status === 'success' && feed.isRefreshing}
        onRefresh={feed.status === 'success' ? feed.refresh : undefined}
        ListEmptyComponent={<FeedState feed={feed} />}
      />

      <ReportContentModal
        visible={reportingPostId !== null}
        targetType="POST"
        targetId={reportingPostId}
        onClose={() => setReportingPostId(null)}
        onSubmit={reportPost}
      />
    </ResponsiveScreen>
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
  feedControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s8,
    paddingHorizontal: SPACING.s16,
    paddingTop: SPACING.s8,
    backgroundColor: COLORS.background,
  },
  feedModeTabs: {
    flexDirection: 'row',
    gap: SPACING.s4,
    padding: SPACING.s2,
    borderRadius: RADIUS.pill,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  feedModeTab: {
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.s12,
    borderRadius: RADIUS.pill,
  },
  feedModeTabActive: {
    backgroundColor: COLORS.primary,
  },
  feedModeText: {
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s12_5,
    color: COLORS.textSecondary,
  },
  feedModeTextActive: {
    color: COLORS.onPrimary,
  },
  searchBar: {
    flex: 1,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s6,
    paddingHorizontal: SPACING.s12,
    borderRadius: RADIUS.pill,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: SPACING.s6,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s13_5,
    color: COLORS.text,
  },
  clearSearchButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.s16,
    paddingTop: SPACING.s16,
  },
  desktopFeedContent: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
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
