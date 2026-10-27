import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ForumPost } from '@/modules/forum/domain/models/ForumPost';
import {
  CATEGORY_COLORS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  OPACITY,
  RADIUS,
  SIZE,
  SPACING,
} from '@/shared/theme';
import { Icon } from '@/shared/ui/atoms/Icon';

import { FORUM_STRINGS } from '../strings';

type ForumPostCardProps = {
  post: ForumPost;
  onCommentsPress: () => void;
};

export function ForumPostCard({ post, onCommentsPress }: ForumPostCardProps) {
  const palette = CATEGORY_COLORS[post.category];

  return (
    <View style={[styles.card, { borderTopColor: palette.main }]}>
      <View style={styles.authorRow}>
        {post.author.avatarUri === null ? (
          <View style={[styles.avatar, { backgroundColor: palette.soft }]}>
            <Text style={[styles.initials, { color: palette.onSoft }]}>{post.author.initials}</Text>
          </View>
        ) : (
          <Image
            source={{ uri: post.author.avatarUri }}
            style={styles.avatar}
            contentFit="cover"
            accessibilityLabel={FORUM_STRINGS.photoOf(post.author.name)}
          />
        )}
        <View style={styles.authorDetails}>
          <Text style={styles.authorName} numberOfLines={1}>
            {post.author.name}
          </Text>
          <View style={styles.authorMeta}>
            <Text style={styles.roleLabel}>{post.author.roleLabel}</Text>
            <Text style={styles.publishedAt}>{post.publishedAtLabel}</Text>
          </View>
        </View>
        <Text
          style={[
            styles.categoryLabel,
            {
              backgroundColor: palette.main,
              color: post.category === 'announcements' ? COLORS.text : COLORS.onPrimary,
            },
          ]}
        >
          {FORUM_STRINGS.categories[post.category]}
        </Text>
      </View>

      {post.media === null ? (
        <View style={[styles.textMedia, { backgroundColor: palette.soft }]}>
          <Text style={[styles.textMediaContent, { color: palette.onSoft }]}>{post.content}</Text>
        </View>
      ) : (
        <>
          <View style={styles.media}>
            <Image
              source={{
                uri: post.media.kind === 'image' ? post.media.uri : post.media.thumbnailUri,
              }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              accessibilityLabel={post.media.accessibilityLabel}
            />
            {post.media.kind === 'video' && (
              <View
                accessible
                accessibilityRole="image"
                accessibilityLabel={FORUM_STRINGS.videoDuration(post.media.durationLabel)}
                style={styles.videoIndicator}
              >
                <Icon name="video" size={SIZE.iconSmall} color={COLORS.onPrimary} />
                <Text style={styles.videoDuration}>{post.media.durationLabel}</Text>
              </View>
            )}
          </View>
          <Text style={styles.content} numberOfLines={3}>
            {post.content}
          </Text>
        </>
      )}

      <View style={styles.actions}>
        <View
          accessible
          accessibilityLabel={FORUM_STRINGS.likeSummary(post.likeCount)}
          style={styles.action}
        >
          <Icon name="heart" size={SIZE.iconSmall} color={COLORS.textSecondary} />
          <Text style={styles.count}>{post.likeCount}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={FORUM_STRINGS.openComments(post.commentCount)}
          onPress={onCommentsPress}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Icon name="message-circle" size={SIZE.iconSmall} color={COLORS.textSecondary} />
          <Text style={styles.count}>{post.commentCount}</Text>
        </Pressable>
        <Icon name="bookmark" size={SIZE.iconSmall} color={COLORS.textSecondary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    overflow: 'hidden',
    borderWidth: 1,
    borderTopWidth: 5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.cardLarge,
    backgroundColor: COLORS.surface,
    paddingBottom: SPACING.s4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s10,
    paddingHorizontal: SPACING.s14,
    paddingVertical: SPACING.s10,
  },
  avatar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
  },
  initials: {
    fontFamily: FONT_FAMILY.headingBold,
    fontSize: FONT_SIZE.s12_5,
  },
  authorDetails: {
    flex: 1,
    minWidth: 0,
    gap: SPACING.s2,
  },
  authorName: {
    fontFamily: FONT_FAMILY.headingBold,
    fontSize: FONT_SIZE.s14,
    color: COLORS.textTitle,
  },
  authorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s6,
  },
  roleLabel: {
    overflow: 'hidden',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.s7,
    backgroundColor: COLORS.surfaceMuted,
    color: COLORS.onSurfaceMuted,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s10_5,
  },
  publishedAt: {
    color: COLORS.textTertiary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s11_5,
  },
  categoryLabel: {
    overflow: 'hidden',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.s10,
    paddingVertical: SPACING.s4,
    color: COLORS.onPrimary,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s11_5,
  },
  media: {
    flex: 1,
    minHeight: 120,
    marginHorizontal: SPACING.s12,
    overflow: 'hidden',
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.surfaceMuted,
  },
  videoIndicator: {
    position: 'absolute',
    left: SPACING.s10,
    bottom: SPACING.s10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s5,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.s9,
    paddingVertical: SPACING.s5,
    backgroundColor: COLORS.text,
  },
  videoDuration: {
    color: COLORS.onPrimary,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s11_5,
  },
  textMedia: {
    flex: 1,
    minHeight: 120,
    justifyContent: 'center',
    gap: SPACING.s12,
    marginHorizontal: SPACING.s12,
    borderRadius: RADIUS.button,
    padding: SPACING.s20,
  },
  textMediaContent: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s18,
    lineHeight: 26,
  },
  content: {
    paddingHorizontal: SPACING.s14,
    paddingTop: SPACING.s10,
    color: COLORS.textStrong,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s13_5,
    lineHeight: 19,
  },
  actions: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s20,
    paddingHorizontal: SPACING.s14,
  },
  action: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s6,
  },
  pressed: {
    opacity: OPACITY.pressed,
  },
  count: {
    color: COLORS.textStrong,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s13,
  },
});
