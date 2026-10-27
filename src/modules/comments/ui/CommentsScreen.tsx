import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/modules/auth';
import {
  useAddComment,
  useComments,
  type CommentsState,
} from '@/modules/comments/application/useComments';
import type { Comment } from '@/modules/comments/domain/models/Comment';
import {
  BORDER_WIDTH,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  OPACITY,
  RADIUS,
  SIZE,
  SPACING,
} from '@/shared/theme';
import { Icon } from '@/shared/ui/atoms/Icon';

import { CommentItem } from './components/CommentItem';
import { COMMENTS_STRINGS } from './strings';

// The sheet covers the lower part of the forum (514 of 844 px in the mockup).
const SHEET_HEIGHT_RATIO = 0.61;

type ReplyTarget = { threadId: string; authorName: string };

type CommentsScreenProps = {
  postId: string;
};

export function CommentsScreen({ postId }: CommentsScreenProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { user } = useAuth();
  const state = useComments(postId);
  const { canComment, addComment, isSending } = useAddComment(postId);
  const [draft, setDraft] = useState('');
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const initials = user?.username.slice(0, 2).toUpperCase() ?? '';
  const canPublish = canComment && !isSending && draft.trim() !== '';

  function handleClose() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  function handleReply(threadId: string, authorName: string) {
    setReplyTarget({ threadId, authorName });
  }

  async function handlePublish() {
    if (!canPublish) {
      return;
    }
    await addComment({ content: draft.trim(), parentId: replyTarget?.threadId ?? null });
    setDraft('');
    setReplyTarget(null);
  }

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={COMMENTS_STRINGS.close}
        onPress={handleClose}
        style={styles.backdrop}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.sheet, { height: windowHeight * SHEET_HEIGHT_RATIO }]}
      >
        <View accessibilityRole="header" style={styles.sheetHeader}>
          <View style={styles.handle} />
          <View style={styles.titleRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={COMMENTS_STRINGS.back}
              onPress={handleClose}
              style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
            >
              <Icon name="chevron-down" size={SIZE.icon} color={COLORS.primary} />
            </Pressable>
            <Text style={styles.title}>{COMMENTS_STRINGS.title}</Text>
            <View style={styles.headerButton} />
          </View>
        </View>

        <FlatList
          data={state.status === 'success' ? state.comments : []}
          keyExtractor={(comment) => comment.id}
          renderItem={({ item }: { item: Comment }) => (
            <CommentItem comment={item} onReply={handleReply} />
          )}
          ListHeaderComponent={
            state.status === 'success' && state.total > 0 ? (
              <Text style={styles.count}>{COMMENTS_STRINGS.count(state.total)}</Text>
            ) : null
          }
          ListEmptyComponent={<CommentsStateView state={state} />}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />

        {replyTarget !== null && (
          <View style={styles.replyBanner}>
            <Text style={styles.replyBannerText} numberOfLines={1}>
              {COMMENTS_STRINGS.replyingTo(replyTarget.authorName)}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={COMMENTS_STRINGS.cancelReply}
              onPress={() => setReplyTarget(null)}
              style={({ pressed }) => [styles.cancelReply, pressed && styles.pressed]}
            >
              <Icon name="x" size={SIZE.iconSmall} color={COLORS.textSecondary} />
            </Pressable>
          </View>
        )}

        <View style={[styles.composer, { paddingBottom: insets.bottom + SPACING.s10 }]}>
          <View style={styles.composerAvatar}>
            <Text style={styles.composerInitials}>{initials}</Text>
          </View>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={COMMENTS_STRINGS.placeholder}
            placeholderTextColor={COLORS.textTertiary}
            accessibilityLabel={COMMENTS_STRINGS.inputLabel}
            editable={canComment}
            onSubmitEditing={handlePublish}
            returnKeyType="send"
            style={styles.input}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={COMMENTS_STRINGS.publishLabel}
            accessibilityState={{ disabled: !canPublish }}
            disabled={!canPublish}
            onPress={handlePublish}
            style={({ pressed }) => [
              styles.publishButton,
              !canPublish && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.publishLabel}>{COMMENTS_STRINGS.publish}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

type CommentsStateViewProps = {
  state: CommentsState;
};

function CommentsStateView({ state }: CommentsStateViewProps) {
  if (state.status === 'loading') {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator color={COLORS.primary} accessibilityLabel={COMMENTS_STRINGS.loading} />
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.stateTitle}>{COMMENTS_STRINGS.errorTitle}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={state.retry}
          style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
        >
          <Text style={styles.retryLabel}>{COMMENTS_STRINGS.retry}</Text>
        </Pressable>
      </View>
    );
  }

  const isUnavailable = state.status === 'unavailable';
  return (
    <View style={styles.stateContainer}>
      <Text style={styles.stateTitle}>
        {isUnavailable ? COMMENTS_STRINGS.unavailableTitle : COMMENTS_STRINGS.emptyTitle}
      </Text>
      <Text style={styles.stateMessage}>
        {isUnavailable ? COMMENTS_STRINGS.unavailableMessage : COMMENTS_STRINGS.emptyMessage}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.backdrop,
  },
  sheet: {
    overflow: 'hidden',
    borderTopLeftRadius: RADIUS.sheet,
    borderTopRightRadius: RADIUS.sheet,
    backgroundColor: COLORS.surface,
  },
  sheetHeader: {
    alignItems: 'center',
    paddingHorizontal: SPACING.s8,
    paddingTop: SPACING.s8,
    paddingBottom: SPACING.s6,
    borderBottomWidth: BORDER_WIDTH.hairline,
    borderBottomColor: COLORS.border,
  },
  handle: {
    width: SIZE.sheetHandleWidth,
    height: SIZE.sheetHandleHeight,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.sheetHandle,
  },
  titleRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: SIZE.touchTarget,
    height: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s18,
    color: COLORS.primary,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.s16,
    paddingBottom: SPACING.s16,
  },
  count: {
    paddingTop: SPACING.s12,
    paddingBottom: SPACING.s2,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s12_5,
    color: COLORS.textTertiary,
  },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s8,
    paddingLeft: SPACING.s16,
    backgroundColor: COLORS.background,
    borderTopWidth: BORDER_WIDTH.hairline,
    borderTopColor: COLORS.border,
  },
  replyBannerText: {
    flex: 1,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s13,
    color: COLORS.textSecondary,
  },
  cancelReply: {
    width: SIZE.touchTarget,
    height: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s10,
    paddingHorizontal: SPACING.s16,
    paddingTop: SPACING.s10,
    backgroundColor: COLORS.surface,
    borderTopWidth: BORDER_WIDTH.hairline,
    borderTopColor: COLORS.border,
  },
  composerAvatar: {
    width: SIZE.avatarComposer,
    height: SIZE.avatarComposer,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.accent,
  },
  composerInitials: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s12_5,
    color: COLORS.text,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: SIZE.touchTarget,
    paddingHorizontal: SPACING.s16,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.inputBackground,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s15,
    color: COLORS.text,
  },
  publishButton: {
    height: SIZE.touchTarget,
    flexShrink: 0,
    justifyContent: 'center',
    paddingHorizontal: SPACING.s14,
  },
  publishLabel: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s15,
    color: COLORS.primary,
  },
  disabled: {
    opacity: OPACITY.disabled,
  },
  pressed: {
    opacity: OPACITY.pressed,
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
    fontSize: FONT_SIZE.s16,
    color: COLORS.textTitle,
  },
  stateMessage: {
    textAlign: 'center',
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14,
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
