import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RoleBadge } from '@/modules/auth';
import type { Post } from '@/shared/domain/models/Post';
import { PROFILE_STRINGS } from '@/modules/profile/ui/strings';
import { formatRelativeTime } from '@/shared/lib/formatRelativeTime';
import {
  BORDER_WIDTH,
  CATEGORY_COLORS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  LINE_HEIGHT,
  RADIUS,
  SIZE,
  SPACING,
} from '@/shared/theme';
import { Icon } from '@/shared/ui/atoms/Icon';

import { Avatar, getAvatarTone } from './Avatar';
import { CategoryLabel } from './CategoryLabel';

// The text is cut after three lines, as in the mockup.
const MAX_TEXT_LINES = 3;

type ProfilePostCardProps = {
  post: Post;
  // Saved posts are from other people, so they show who wrote them.
  isAuthorShown: boolean;
};

// Compact post card of the profile lists (category stripe, text, thumbnail and counts).
export const ProfilePostCard = memo(function ProfilePostCard({
  post,
  isAuthorShown,
}: ProfilePostCardProps) {
  return (
    <View style={[styles.card, { borderLeftColor: CATEGORY_COLORS[post.category].main }]}>
      <View style={styles.row}>
        <CategoryLabel category={post.category} />
        <Text style={styles.time}>{formatRelativeTime(post.createdAt)}</Text>
      </View>

      {isAuthorShown && (
        <View style={styles.row}>
          <Avatar
            name={post.author.fullName}
            photoUrl={post.author.photoUrl}
            size="small"
            tone={getAvatarTone(post.author.id)}
          />
          <Text style={styles.author}>{post.author.fullName}</Text>
          <RoleBadge roles={post.author.roles} />
        </View>
      )}

      <View style={styles.body}>
        <Text numberOfLines={MAX_TEXT_LINES} style={styles.text}>
          {post.text}
        </Text>
        {post.imageUrl !== null && (
          <Image
            source={post.imageUrl}
            contentFit="cover"
            accessibilityLabel={post.imageDescription ?? undefined}
            style={styles.thumbnail}
          />
        )}
      </View>

      <View style={styles.counts}>
        <View
          accessible
          accessibilityLabel={PROFILE_STRINGS.post.likes(post.likeCount)}
          style={styles.count}
        >
          <Icon name="heart" size={SIZE.iconSmall} color={COLORS.textSecondary} />
          <Text style={styles.countText}>{post.likeCount}</Text>
        </View>
        <View
          accessible
          accessibilityLabel={PROFILE_STRINGS.post.comments(post.commentCount)}
          style={styles.count}
        >
          <Icon name="message-circle" size={SIZE.iconSmall} color={COLORS.textSecondary} />
          <Text style={styles.countText}>{post.commentCount}</Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    gap: SPACING.s9,
    paddingTop: SPACING.s13,
    paddingHorizontal: SPACING.s13,
    paddingBottom: SPACING.s8,
    backgroundColor: COLORS.surface,
    borderWidth: BORDER_WIDTH.hairline,
    borderLeftWidth: BORDER_WIDTH.stripe,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s8,
  },
  time: {
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s12,
    color: COLORS.textTertiary,
  },
  author: {
    fontFamily: FONT_FAMILY.headingBold,
    fontSize: FONT_SIZE.s13,
    color: COLORS.textTitle,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.s12,
  },
  text: {
    flex: 1,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14,
    lineHeight: LINE_HEIGHT.body,
    color: COLORS.textBody,
  },
  thumbnail: {
    width: SIZE.thumbnail,
    height: SIZE.thumbnail,
    borderRadius: RADIUS.field,
    backgroundColor: COLORS.infoSoft,
  },
  counts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s16,
    paddingTop: SPACING.s2,
  },
  count: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s5,
  },
  countText: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s13,
    color: COLORS.textStrong,
  },
});
