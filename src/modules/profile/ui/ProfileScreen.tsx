import { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';

import { useAuth } from '@/modules/auth';
import { useMyProfile } from '@/modules/profile/application/useMyProfile';
import { toProfileError } from '@/modules/profile/domain/models/ProfileError';
import type { UpdateProfileInput } from '@/modules/profile/domain/ProfileService';
import type { Post } from '@/shared/domain/models/Post';
import { PROFILE_ERROR_MESSAGES, PROFILE_STRINGS } from '@/modules/profile/ui/strings';
import { useProfileService } from '@/modules/profile/useProfileService';
import { useCollapsingHeader } from '@/shared/hooks/useCollapsingHeader';
import { pickImageFromLibrary } from '@/shared/lib/imagePicker';
import {
  BORDER_WIDTH,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  RADIUS,
  SIZE,
  SPACING,
} from '@/shared/theme';
import { Button } from '@/shared/ui/atoms/Button';
import { Icon } from '@/shared/ui/atoms/Icon';
import { HeaderTeal } from '@/shared/ui/organisms/HeaderTeal';
import { ResponsiveScreen } from '@/shared/ui/templates/ResponsiveScreen';

import { EditProfileModal } from './components/EditProfileModal';
import { InfoCard } from './components/InfoCard';
import { ProfilePostCard } from './components/ProfilePostCard';
import { ProfileSummary } from './components/ProfileSummary';
import { ProfileTabs } from './components/ProfileTabs';
import { StatsCard } from './components/StatsCard';
import { StatusMessage } from './components/StatusMessage';

const HEADER_ROW_HEIGHT = 66;

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { isAnonymous, signOut } = useAuth();
  const service = useProfileService();
  const { profile, posts, activeTab, selectTab } = useMyProfile(service);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const expandedHeaderHeight = insets.top + HEADER_ROW_HEIGHT;
  const { headerHeight, onScroll } = useCollapsingHeader(expandedHeaderHeight);
  const { refresh: refreshProfile } = profile;
  const { refresh: refreshPosts } = posts;
  const hasBeenFocused = useRef(false);

  const focusCallback = useCallback(() => {
    if (!hasBeenFocused.current) {
      hasBeenFocused.current = true;
      return;
    }
    refreshProfile();
    refreshPosts();
  }, [refreshProfile, refreshPosts]);

  // Counters (followers, following, posts) change from other screens: refresh them
  // in the background every time the tab is shown again (the first load is already running).
  useFocusEffect?.(focusCallback);

  async function handleSignIn() {
    await signOut();
    router.replace('/login');
  }

  async function handleChangePhoto() {
    const result = await pickImageFromLibrary({ isSquare: true });
    if (result.status === 'denied') {
      setPhotoError(PROFILE_STRINGS.photo.permissionDenied);
      return;
    }
    if (result.status === 'cancelled' || !service.uploadAvatar || !service.updateMyProfile) {
      return;
    }

    setPhotoError(null);
    setIsUploadingPhoto(true);
    try {
      const uploadedUrl = await service.uploadAvatar(result.file);
      await service.updateMyProfile({ avatarUrl: uploadedUrl });
      profile.refresh();
    } catch {
      // Alert.alert does nothing on web, so the error is shown inline.
      setPhotoError(PROFILE_STRINGS.photo.uploadFailed);
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  // A guest has no personal profile: only the ways out of the guest session.
  if (isAnonymous) {
    return (
      <ResponsiveScreen>
        <View style={styles.screen}>
          <HeaderTeal
            title={PROFILE_STRINGS.headerTitle}
            headerHeight={headerHeight}
            paddingTop={insets.top + SPACING.s8}
            leftAccessory={null}
            rightAccessory={null}
          />
          <View style={styles.guestContent}>
            <View style={styles.guestCard}>
              <Text accessibilityRole="header" style={styles.guestTitle}>
                {PROFILE_STRINGS.guest.title}
              </Text>
              <Text style={styles.guestMessage}>{PROFILE_STRINGS.guest.message}</Text>
              <Button
                label={PROFILE_STRINGS.signIn}
                iconRight="arrow-right"
                onPress={() => void handleSignIn()}
              />
              <Button
                label={PROFILE_STRINGS.signOut}
                variant="outline"
                onPress={() => void signOut()}
              />
            </View>
          </View>
        </View>
      </ResponsiveScreen>
    );
  }

  if (profile.status !== 'success') {
    return (
      <ResponsiveScreen>
        <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
          {profile.status === 'loading' ? (
            <StatusMessage kind="loading" />
          ) : (
            <StatusMessage
              kind="error"
              message={PROFILE_ERROR_MESSAGES[toProfileError(profile.error).kind]}
              onRetry={profile.reload}
            />
          )}
        </View>
      </ResponsiveScreen>
    );
  }

  const me = profile.data;
  const isSavedTab = activeTab === 'saved';
  const canOpenModerationPanel = me.roles.includes('ADMIN') || me.roles.includes('MODERATOR');

  async function handleSaveProfile(input: UpdateProfileInput) {
    if (service.updateMyProfile) {
      await service.updateMyProfile(input);
      profile.refresh();
    }
  }

  const header = (
    <View style={styles.header}>
      <ProfileSummary
        fullName={me.fullName}
        roles={me.roles}
        photoUrl={me.photoUrl}
        isUploading={isUploadingPhoto}
        onChangePhoto={() => void handleChangePhoto()}
      />
      {photoError !== null ? (
        <Text accessibilityRole="alert" style={styles.photoError}>
          {photoError}
        </Text>
      ) : null}
      <StatsCard
        postCount={me.postCount}
        followerCount={me.followerCount}
        followingCount={me.followingCount}
        onFollowersPress={() => router.push('/profile/followers')}
      />
      {canOpenModerationPanel ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={PROFILE_STRINGS.openAdminPanel}
          onPress={() => router.push('/admin')}
          style={({ pressed }) => [styles.adminButton, pressed && styles.pressed]}
        >
          <Text style={styles.adminButtonText}>{PROFILE_STRINGS.adminPanel}</Text>
        </Pressable>
      ) : null}
      <InfoCard profile={me} onEdit={() => setIsEditOpen(true)} />
      <ProfileTabs
        activeTab={activeTab}
        postCount={me.postCount}
        savedCount={me.savedCount}
        onSelect={selectTab}
      />
    </View>
  );

  let listStatus;
  if (posts.status === 'loading') {
    listStatus = <StatusMessage kind="loading" />;
  } else if (posts.status === 'error') {
    listStatus = (
      <StatusMessage kind="error" message={PROFILE_STRINGS.listError} onRetry={posts.reload} />
    );
  } else {
    listStatus = (
      <StatusMessage
        kind="message"
        message={isSavedTab ? PROFILE_STRINGS.empty.saved : PROFILE_STRINGS.empty.posts}
      />
    );
  }

  return (
    <>
      <ResponsiveScreen>
        <View style={styles.screen}>
          <HeaderTeal
            title={PROFILE_STRINGS.headerTitle}
            headerHeight={headerHeight}
            paddingTop={insets.top + SPACING.s8}
            leftAccessory={null}
            rightAccessory={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={PROFILE_STRINGS.openSettings}
                onPress={() => router.push('/profile/settings')}
                style={({ pressed }) => [styles.headerActionButton, pressed && styles.pressed]}
              >
                <Icon name="settings" size={SIZE.icon} color={COLORS.onPrimary} />
              </Pressable>
            }
          />
          <FlatList<Post>
            style={styles.screen}
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={[styles.content, { paddingTop: SPACING.s18 }]}
            data={posts.status === 'success' ? posts.data : []}
            keyExtractor={(post) => post.id}
            renderItem={({ item }) => (
              <ProfilePostCard
                post={item}
                isAuthorShown={isSavedTab}
                onPress={
                  isSavedTab
                    ? undefined
                    : () =>
                        router.push({
                          pathname: '/users/[userId]/posts/[postId]',
                          params: { userId: me.id, postId: item.id },
                        })
                }
              />
            )}
            ListHeaderComponent={header}
            ListEmptyComponent={listStatus}
            ItemSeparatorComponent={Separator}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ResponsiveScreen>

      <EditProfileModal
        key={`${me.fullName}:${me.city ?? ''}:${me.shortBio ?? ''}`}
        visible={isEditOpen}
        profile={me}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveProfile}
      />
    </>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    justifyContent: 'center',
  },
  guestContent: {
    padding: SPACING.s20,
  },
  guestCard: {
    gap: SPACING.s14,
    padding: SPACING.s20,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
  },
  guestTitle: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s20,
  },
  guestMessage: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s15,
  },
  headerActionButton: {
    width: SIZE.touchTarget,
    height: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.headerButton,
    backgroundColor: COLORS.headerButton,
  },
  content: {
    paddingHorizontal: SPACING.s20,
    paddingBottom: SPACING.s24,
  },
  header: {
    gap: SPACING.s14,
    paddingBottom: SPACING.s14,
  },
  adminButton: {
    minHeight: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.s16,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.primary,
  },
  adminButtonText: {
    color: COLORS.onPrimary,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s14,
  },
  pressed: {
    opacity: 0.7,
  },
  photoError: {
    color: COLORS.danger,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14,
  },
  separator: {
    height: SPACING.s14,
  },
});
