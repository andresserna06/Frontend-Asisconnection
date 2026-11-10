import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTogglePostLike } from '@/modules/forum';
import { useActorPost } from '@/modules/profile/application/useActorPost';
import { useContentRemoval } from '@/modules/removal';
import { usePublicProfileService } from '@/modules/profile/usePublicProfileService';
import { COLORS, OPACITY, RADIUS, SIZE, SPACING } from '@/shared/theme';
import { Icon } from '@/shared/ui/atoms/Icon';
import { HeaderTeal } from '@/shared/ui/organisms/HeaderTeal';
import { ResponsiveScreen } from '@/shared/ui/templates/ResponsiveScreen';

import { ActorPostCard } from './components/ActorPostCard';
import { StatusMessage } from './components/StatusMessage';
import { PROFILE_STRINGS } from './strings';

const HEADER_ROW_HEIGHT = 66;

export function ActorPostScreen() {
  const insets = useSafeAreaInsets();
  const { userId, postId } = useLocalSearchParams<{ userId: string; postId: string }>();
  const service = usePublicProfileService();
  const post = useActorPost(service, userId, postId);
  const togglePostLike = useTogglePostLike();
  const { isHidden } = useContentRemoval();
  const loadedPost = post.status === 'success' ? post.data : null;
  const currentPost = loadedPost !== null && !isHidden(loadedPost.id) ? loadedPost : null;

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  return (
    <ResponsiveScreen>
      <View style={styles.screen}>
        <HeaderTeal
          title={PROFILE_STRINGS.postDetail.header}
          headerHeight={insets.top + HEADER_ROW_HEIGHT}
          paddingTop={insets.top + SPACING.s8}
          leftAccessory={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={PROFILE_STRINGS.postDetail.back}
              onPress={handleBack}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Icon name="chevron-left" size={SIZE.icon} color={COLORS.onPrimary} />
            </Pressable>
          }
          rightAccessory={null}
        />

        {post.status === 'loading' ? (
          <StatusMessage kind="loading" />
        ) : post.status === 'error' ? (
          <StatusMessage kind="error" message={PROFILE_STRINGS.listError} onRetry={post.reload} />
        ) : currentPost === null ? (
          <StatusMessage kind="message" message={PROFILE_STRINGS.postDetail.notFound} />
        ) : (
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.s24 }]}
            showsVerticalScrollIndicator={false}
          >
            <ActorPostCard
              post={currentPost}
              onCommentsPress={() => router.push(`/comments/${currentPost.id}`)}
              onLikePress={() => togglePostLike(currentPost.id)}
              onRemoved={handleBack}
            />
          </ScrollView>
        )}
      </View>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
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
  pressed: {
    opacity: OPACITY.pressed,
  },
  content: {
    paddingHorizontal: SPACING.s20,
    paddingTop: SPACING.s18,
  },
});
