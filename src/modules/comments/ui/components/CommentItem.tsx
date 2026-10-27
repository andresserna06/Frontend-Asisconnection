import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Comment } from '@/modules/comments/domain/models/Comment';
import {
  BORDER_WIDTH,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  LINE_HEIGHT,
  OPACITY,
  RADIUS,
  SIZE,
  SPACING,
} from '@/shared/theme';
import { Icon } from '@/shared/ui/atoms/Icon';

import { COMMENTS_STRINGS } from '../strings';

type CommentItemProps = {
  comment: Comment;
  // Set for replies: they are indented and answering one stays in the same thread.
  threadId?: string;
  onReply: (threadId: string, authorName: string) => void;
};

export function CommentItem({ comment, threadId, onReply }: CommentItemProps) {
  const isReply = threadId !== undefined;
  const [isExpanded, setIsExpanded] = useState(false);
  // Local only until the backend exposes likes for comments.
  const [isLiked, setIsLiked] = useState(false);
  const likeCount = comment.likeCount + (isLiked ? 1 : 0);
  const hasReplies = comment.replies.length > 0;

  return (
    <View>
      <View style={[styles.row, isReply && styles.replyRow]}>
        <View
          style={[
            styles.avatar,
            isReply && styles.replyAvatar,
            comment.author.isFoundation && styles.foundationAvatar,
          ]}
        >
          <Text
            style={[
              styles.initials,
              isReply && styles.replyInitials,
              comment.author.isFoundation && styles.foundationInitials,
            ]}
          >
            {comment.author.initials}
          </Text>
        </View>

        <View style={styles.body}>
          <View style={styles.meta}>
            <Text style={styles.name} numberOfLines={1}>
              {comment.author.name}
            </Text>
            <Text style={styles.time}>{comment.publishedAtLabel}</Text>
            {comment.author.isFoundation && (
              <Text style={styles.badge}>{COMMENTS_STRINGS.foundationBadge}</Text>
            )}
          </View>
          <Text style={styles.content}>{comment.content}</Text>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onReply(threadId ?? comment.id, comment.author.name)}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <Text style={styles.replyLabel}>{COMMENTS_STRINGS.reply}</Text>
            </Pressable>
            {hasReplies && (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: isExpanded }}
                onPress={() => setIsExpanded((value) => !value)}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.threadButton,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.threadLine} />
                <Text style={styles.threadLabel}>
                  {isExpanded
                    ? COMMENTS_STRINGS.hideReplies
                    : COMMENTS_STRINGS.showReplies(comment.replies.length)}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={COMMENTS_STRINGS.like}
          accessibilityHint={COMMENTS_STRINGS.likeSummary(likeCount)}
          accessibilityState={{ selected: isLiked }}
          onPress={() => setIsLiked((value) => !value)}
          style={({ pressed }) => [styles.like, pressed && styles.pressed]}
        >
          <Icon
            name="heart"
            size={SIZE.iconSmall}
            color={isLiked ? COLORS.alert : COLORS.textSecondary}
          />
          <Text style={styles.likeCount}>{likeCount}</Text>
        </Pressable>
      </View>

      {isExpanded &&
        comment.replies.map((reply) => (
          <CommentItem key={reply.id} comment={reply} threadId={comment.id} onReply={onReply} />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: SPACING.s12,
    paddingTop: SPACING.s12,
    paddingBottom: SPACING.s2,
  },
  replyRow: {
    paddingLeft: SPACING.s50,
  },
  avatar: {
    width: SIZE.avatarComment,
    height: SIZE.avatarComment,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.secondarySoft,
  },
  replyAvatar: {
    width: SIZE.avatarReply,
    height: SIZE.avatarReply,
  },
  foundationAvatar: {
    backgroundColor: COLORS.accent,
  },
  initials: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s13,
    color: COLORS.onSecondarySoft,
  },
  replyInitials: {
    fontSize: FONT_SIZE.s10_5,
  },
  foundationInitials: {
    color: COLORS.text,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: SPACING.s4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s7,
  },
  name: {
    flexShrink: 1,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s13_5,
    color: COLORS.textTitle,
  },
  time: {
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s12,
    color: COLORS.textTertiary,
  },
  badge: {
    overflow: 'hidden',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.s8,
    paddingVertical: SPACING.s1,
    backgroundColor: COLORS.accent,
    color: COLORS.text,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s10_5,
  },
  content: {
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14_5,
    lineHeight: LINE_HEIGHT.comment,
    color: COLORS.text,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s4,
    marginTop: SPACING.s2,
  },
  actionButton: {
    minHeight: SIZE.avatarAction,
    justifyContent: 'center',
    paddingRight: SPACING.s8,
  },
  threadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s8,
    paddingLeft: SPACING.s8,
  },
  threadLine: {
    width: SPACING.s20,
    height: BORDER_WIDTH.medium,
    backgroundColor: COLORS.secondaryBorder,
  },
  replyLabel: {
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s12_5,
    color: COLORS.textSecondary,
  },
  threadLabel: {
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s12_5,
    color: COLORS.primary,
  },
  like: {
    width: SIZE.likeColumn,
    flexShrink: 0,
    alignItems: 'center',
    gap: SPACING.s2,
    paddingTop: SPACING.s2,
  },
  likeCount: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s11_5,
    color: COLORS.textSecondary,
  },
  pressed: {
    opacity: OPACITY.pressed,
  },
});
