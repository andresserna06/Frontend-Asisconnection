import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RoleBadge } from '@/modules/auth';
import { CATEGORIES } from '@/modules/posts';
import { PROFILE_STRINGS } from '@/modules/profile/ui/strings';
import { RemoveContentButton } from '@/modules/removal';
import type { Post } from '@/shared/domain/models/Post';
import { useReactionToggle } from '@/shared/hooks/useReactionToggle';
import { formatRelativeTime } from '@/shared/lib/formatRelativeTime';
import {
  BORDER_WIDTH,
  CATEGORY_COLORS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  LINE_HEIGHT,
  OPACITY,
  RADIUS,
  SIZE,
  SPACING,
} from '@/shared/theme';
import { Avatar, getAvatarTone } from '@/shared/ui/atoms/Avatar';
import { CategoryChip } from '@/shared/ui/atoms/CategoryChip';
import { Icon } from '@/shared/ui/atoms/Icon';

const IMAGE_ASPECT_RATIO = 16 / 10;

type ActorPostCardProps = {
  post: Post;
  onCommentsPress: () => void;
  // Resolves with whether the viewer's like is active after the toggle.
  onLikePress: () => Promise<boolean>;
  onRemoved: () => void;
};

// A post shown in full: complete text, large image, like and comments.
export function ActorPostCard({
  post,
  onCommentsPress,
  onLikePress,
  onRemoved,
}: ActorPostCardProps) {
  const like = useReactionToggle(post.likeCount, onLikePress, `post:${post.id}`);

  return (
    <View style={[styles.card, { borderTopColor: CATEGORY_COLORS[post.category].main }]}>
      <View style={styles.authorRow}>
        <Avatar
          name={post.author.fullName}
          photoUrl={post.author.photoUrl}
          size="small"
          tone={getAvatarTone(post.author.id)}
        />
        <View style={styles.authorDetails}>
          <Text numberOfLines={1} style={styles.author}>
            {post.author.fullName}
          </Text>
          <View style={styles.authorMeta}>
            <RoleBadge roles={post.author.roles} />
            <Text style={styles.time}>{formatRelativeTime(post.createdAt)}</Text>
          </View>
        </View>
        <CategoryChip
          label={CATEGORIES[post.category].label}
          category={post.category}
          variant="label"
        />
      </View>

      <Text style={styles.text}>{post.text}</Text>

      {post.imageUrl !== null && (
        <Image
          source={post.imageUrl}
          contentFit="contain"
          accessibilityLabel={post.imageDescription ?? undefined}
          style={styles.image}
        />
      )}

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={PROFILE_STRINGS.post.likes(like.count)}
          accessibilityState={{ selected: like.isActive }}
          onPress={like.toggle}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Icon
            name="heart"
            size={SIZE.icon}
            color={like.isActive ? COLORS.alert : COLORS.textSecondary}
          />
          <Text style={styles.count}>{like.count}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={PROFILE_STRINGS.post.comments(post.commentCount)}
          onPress={onCommentsPress}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Icon name="message-circle" size={SIZE.icon} color={COLORS.textSecondary} />
          <Text style={styles.count}>{post.commentCount}</Text>
        </Pressable>
        <View style={styles.actionsSpacer} />
        <RemoveContentButton
          target={{
            kind: 'post',
            id: post.id,
            authorName: post.author.fullName,
            authorProfileId: post.author.id,
          }}
          onRemoved={onRemoved}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: SPACING.s12,
    padding: SPACING.s16,
    paddingBottom: SPACING.s4,
    backgroundColor: COLORS.surface,
    borderWidth: BORDER_WIDTH.hairline,
    borderTopWidth: BORDER_WIDTH.stripe,
    borderColor: COLORS.border,
    borderRadius: RADIUS.cardLarge,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s10,
  },
  authorDetails: {
    flex: 1,
    minWidth: 0,
    gap: SPACING.s2,
  },
  author: {
    fontFamily: FONT_FAMILY.headingBold,
    fontSize: FONT_SIZE.s16,
    color: COLORS.textTitle,
  },
  authorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s6,
  },
  time: {
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s12,
    color: COLORS.textTertiary,
  },
  text: {
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s16,
    lineHeight: LINE_HEIGHT.name,
    color: COLORS.textBody,
  },
  image: {
    width: '100%',
    aspectRatio: IMAGE_ASPECT_RATIO,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.surfaceMuted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s20,
  },
  actionsSpacer: {
    flex: 1,
  },
  action: {
    minHeight: SIZE.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s6,
  },
  pressed: {
    opacity: OPACITY.pressed,
  },
  count: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s14,
    color: COLORS.textStrong,
  },
});
