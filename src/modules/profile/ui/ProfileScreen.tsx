import { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';

import { useAuth } from '@/modules/auth';
import { CATEGORIES } from '@/modules/posts';
import { useRefreshMyPhotoUrl } from '@/modules/profile/application/useMyPhotoUrl';
import { useMyProfile, type ProfileContentTab } from '@/modules/profile/application/useMyProfile';
import { toProfileError } from '@/modules/profile/domain/models/ProfileError';
import type {
  MyPostSubmission,
  MySubmissionStatus,
  UpdateProfileInput,
} from '@/modules/profile/domain/ProfileService';
import type { Post } from '@/shared/domain/models/Post';
import { PROFILE_ERROR_MESSAGES, PROFILE_STRINGS } from '@/modules/profile/ui/strings';
import { useProfileService } from '@/modules/profile/useProfileService';
import { useContentRemoval } from '@/modules/removal';
import { useCollapsingHeader } from '@/shared/hooks/useCollapsingHeader';
import { formatRelativeTime } from '@/shared/lib/formatRelativeTime';
import { pickImageFromLibrary } from '@/shared/lib/imagePicker';
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
import { Button } from '@/shared/ui/atoms/Button';
import { CategoryChip } from '@/shared/ui/atoms/CategoryChip';
import { Icon } from '@/shared/ui/atoms/Icon';
import { HeaderTeal } from '@/shared/ui/organisms/HeaderTeal';
import { ResponsiveScreen } from '@/shared/ui/templates/ResponsiveScreen';

import { EditPostModal } from './components/EditPostModal';
import { EditProfileModal } from './components/EditProfileModal';
import { InfoCard } from './components/InfoCard';
import { ProfilePostCard } from './components/ProfilePostCard';
import { ProfileSummary } from './components/ProfileSummary';
import { StatsCard } from './components/StatsCard';
import { StatusMessage } from './components/StatusMessage';

const HEADER_ROW_HEIGHT = 66;

const SUBMISSION_FILTERS: { key: MySubmissionStatus | undefined; label: string }[] = [
  { key: undefined, label: PROFILE_STRINGS.submissions.filters.all },
  { key: 'PENDING', label: PROFILE_STRINGS.submissions.filters.PENDING },
  { key: 'APPROVED', label: PROFILE_STRINGS.submissions.filters.APPROVED },
  { key: 'REJECTED', label: PROFILE_STRINGS.submissions.filters.REJECTED },
];

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAnonymous, signOut } = useAuth();
  const service = useProfileService();
  const refreshMyPhotoUrl = useRefreshMyPhotoUrl();
  const {
    profile,
    posts,
    savedPosts,
    submissions,
    activeTab,
    selectTab,
    submissionStatus,
    selectSubmissionStatus,
  } = useMyProfile(service);
  const { isHidden } = useContentRemoval();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<MyPostSubmission | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const expandedHeaderHeight = insets.top + HEADER_ROW_HEIGHT;
  const { headerHeight, onScroll } = useCollapsingHeader(expandedHeaderHeight);
  const { refresh: refreshProfile } = profile;
  const { refresh: refreshPosts } = posts;
  const { refresh: refreshSaved } = savedPosts;
  const { refresh: refreshSubmissions } = submissions;
  const hasBeenFocused = useRef(false);
  const hasSavedSupport = typeof service.getMySavedPosts === 'function';
  const hasSubmissionsSupport = typeof service.getMySubmissions === 'function';
  const hasContentSections = hasSavedSupport || hasSubmissionsSupport;

  const focusCallback = useCallback(() => {
    if (!hasBeenFocused.current) {
      hasBeenFocused.current = true;
      return;
    }
    refreshProfile();
    refreshPosts();
    refreshSaved();
    refreshSubmissions();
  }, [refreshProfile, refreshPosts, refreshSaved, refreshSubmissions]);

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
      refreshMyPhotoUrl();
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
              {user?.username ? (
                <Text style={styles.guestNickname}>
                  {`${PROFILE_STRINGS.guest.nicknamePrefix} ${user.username}`}
                </Text>
              ) : null}
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
  const canOpenModerationPanel = me.roles.includes('ADMIN') || me.roles.includes('MODERATOR');
  const myVisiblePosts =
    posts.status === 'success' ? posts.data.filter((post) => !isHidden(post.id)) : [];
  const myVisibleSavedPosts =
    savedPosts.status === 'success' ? savedPosts.data.filter((post) => !isHidden(post.id)) : [];
  const myVisibleSubmissions =
    submissions.status === 'success' ? submissions.data.filter((item) => !isHidden(item.id)) : [];
  const hiddenPostCount =
    posts.status === 'success' ? posts.data.length - myVisiblePosts.length : 0;
  const visiblePostCount = Math.max(0, me.postCount - hiddenPostCount);

  async function handleSaveProfile(input: UpdateProfileInput) {
    if (service.updateMyProfile) {
      await service.updateMyProfile(input);
      profile.refresh();
    }
  }

  async function handleDeleteSubmission(submissionId: string) {
    if (!service.deletePost) {
      return;
    }
    try {
      await service.deletePost(submissionId);
      submissions.refresh();
      posts.refresh();
      profile.refresh();
    } catch {
      // Ignore transient delete error in list.
    }
  }

  const sectionTabs: { key: ProfileContentTab; label: string }[] = [
    { key: 'posts', label: PROFILE_STRINGS.sections.posts },
    ...(hasSavedSupport ? [{ key: 'saved' as const, label: PROFILE_STRINGS.sections.saved }] : []),
    ...(hasSubmissionsSupport
      ? [{ key: 'submissions' as const, label: PROFILE_STRINGS.sections.submissions }]
      : []),
  ];

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
        postCount={visiblePostCount}
        followerCount={me.followerCount}
        followingCount={me.followingCount}
        onFollowersPress={() => router.push('/profile/followers')}
        onFollowingPress={
          hasContentSections
            ? () => router.push({ pathname: '/profile/followers', params: { tab: 'following' } })
            : undefined
        }
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
      <Text accessibilityRole="header" style={styles.postsTitle}>
        {PROFILE_STRINGS.publicProfile.posts(visiblePostCount)}
      </Text>
      {hasContentSections ? (
        <View accessibilityRole="tablist" style={styles.sectionTabs}>
          {sectionTabs.map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                accessibilityRole="tab"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: isSelected }}
                onPress={() => selectTab(tab.key)}
                style={({ pressed }) => [
                  styles.sectionTab,
                  isSelected && styles.sectionTabActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.sectionTabText, isSelected && styles.sectionTabTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {activeTab === 'submissions' ? (
        <View style={styles.submissionFilters}>
          {SUBMISSION_FILTERS.map((filter) => {
            const isSelected = submissionStatus === filter.key;
            return (
              <Pressable
                key={filter.key ?? 'all'}
                accessibilityRole="button"
                accessibilityLabel={filter.label}
                accessibilityState={{ selected: isSelected }}
                onPress={() => selectSubmissionStatus(filter.key)}
                style={({ pressed }) => [
                  styles.submissionFilterChip,
                  isSelected && styles.submissionFilterChipActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.submissionFilterText,
                    isSelected && styles.submissionFilterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );

  const activeAsyncList =
    activeTab === 'saved' ? savedPosts : activeTab === 'submissions' ? submissions : posts;
  const emptyMessage =
    activeTab === 'saved'
      ? PROFILE_STRINGS.empty.saved
      : activeTab === 'submissions'
        ? PROFILE_STRINGS.empty.submissions
        : PROFILE_STRINGS.empty.posts;

  let listStatus;
  if (activeAsyncList.status === 'loading') {
    listStatus = <StatusMessage kind="loading" />;
  } else if (activeAsyncList.status === 'error') {
    listStatus = (
      <StatusMessage
        kind="error"
        message={PROFILE_STRINGS.listError}
        onRetry={activeAsyncList.reload}
      />
    );
  } else {
    listStatus = <StatusMessage kind="message" message={emptyMessage} />;
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
          {activeTab === 'submissions' ? (
            <FlatList<MyPostSubmission>
              style={styles.screen}
              onScroll={onScroll}
              scrollEventThrottle={16}
              contentContainerStyle={[styles.content, { paddingTop: SPACING.s18 }]}
              data={myVisibleSubmissions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <SubmissionCard
                  item={item}
                  onEdit={service.updatePost ? () => setEditingSubmission(item) : undefined}
                  onDelete={
                    service.deletePost ? () => void handleDeleteSubmission(item.id) : undefined
                  }
                />
              )}
              ListHeaderComponent={header}
              ListEmptyComponent={listStatus}
              ItemSeparatorComponent={Separator}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <FlatList<Post>
              style={styles.screen}
              onScroll={onScroll}
              scrollEventThrottle={16}
              contentContainerStyle={[styles.content, { paddingTop: SPACING.s18 }]}
              data={activeTab === 'saved' ? myVisibleSavedPosts : myVisiblePosts}
              keyExtractor={(post) => post.id}
              renderItem={({ item }) => (
                <ProfilePostCard
                  post={item}
                  onPress={() =>
                    router.push({
                      pathname: '/users/[userId]/posts/[postId]',
                      params: {
                        userId: activeTab === 'saved' ? item.author.id : me.id,
                        postId: item.id,
                      },
                    })
                  }
                />
              )}
              ListHeaderComponent={header}
              ListEmptyComponent={listStatus}
              ItemSeparatorComponent={Separator}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ResponsiveScreen>

      <EditProfileModal
        key={`${me.fullName}:${me.city ?? ''}:${me.shortBio ?? ''}:${me.birthDate ?? ''}`}
        visible={isEditOpen}
        profile={me}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveProfile}
      />

      {editingSubmission !== null && service.updatePost ? (
        <EditPostModal
          visible={editingSubmission !== null}
          initialContent={editingSubmission.content}
          onClose={() => setEditingSubmission(null)}
          onSave={(content) => service.updatePost!(editingSubmission.id, { content })}
          onSaved={() => {
            submissions.refresh();
            posts.refresh();
          }}
        />
      ) : null}
    </>
  );
}

type SubmissionCardProps = {
  item: MyPostSubmission;
  onEdit?: () => void;
  onDelete?: () => void;
};

function SubmissionCard({ item, onEdit, onDelete }: SubmissionCardProps) {
  const statusLabel = PROFILE_STRINGS.submissions.statusLabels[item.status];
  const rejectionLabel =
    item.status === 'REJECTED' && item.rejectionReason
      ? (PROFILE_STRINGS.submissions.rejectionReasons[
          item.rejectionReason as keyof typeof PROFILE_STRINGS.submissions.rejectionReasons
        ] ?? item.rejectionReason)
      : null;

  return (
    <View style={[styles.submissionCard, { borderLeftColor: CATEGORY_COLORS[item.category].main }]}>
      <View style={styles.submissionRow}>
        <CategoryChip
          label={CATEGORIES[item.category].label}
          category={item.category}
          variant="label"
        />
        <Text style={styles.submissionTime}>{formatRelativeTime(item.createdAt)}</Text>
        <View
          style={[
            styles.statusBadge,
            item.status === 'APPROVED'
              ? styles.statusApproved
              : item.status === 'REJECTED'
                ? styles.statusRejected
                : styles.statusPending,
          ]}
        >
          <Text style={styles.statusBadgeText}>{statusLabel}</Text>
        </View>
      </View>

      <Text style={styles.submissionText}>{item.content}</Text>

      {rejectionLabel !== null ? (
        <Text style={styles.rejectionReason}>{rejectionLabel}</Text>
      ) : null}

      {onEdit || onDelete ? (
        <View style={styles.submissionActions}>
          {onEdit ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={PROFILE_STRINGS.submissions.edit}
              onPress={onEdit}
              style={({ pressed }) => [styles.submissionActionButton, pressed && styles.pressed]}
            >
              <Icon name="edit-2" size={SIZE.iconTiny} color={COLORS.primary} />
              <Text style={styles.submissionEditText}>{PROFILE_STRINGS.submissions.edit}</Text>
            </Pressable>
          ) : null}
          {onDelete ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={PROFILE_STRINGS.submissions.delete}
              onPress={onDelete}
              style={({ pressed }) => [styles.submissionActionButton, pressed && styles.pressed]}
            >
              <Icon name="trash-2" size={SIZE.iconTiny} color={COLORS.danger} />
              <Text style={styles.submissionDeleteText}>{PROFILE_STRINGS.submissions.delete}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
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
  guestNickname: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s15,
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
    opacity: OPACITY.pressed,
  },
  photoError: {
    color: COLORS.danger,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14,
  },
  postsTitle: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s16,
  },
  sectionTabs: {
    flexDirection: 'row',
    gap: SPACING.s8,
  },
  sectionTab: {
    flex: 1,
    minHeight: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.headerButton,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  sectionTabActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  sectionTabText: {
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s13,
    color: COLORS.textSecondary,
  },
  sectionTabTextActive: {
    color: COLORS.onPrimary,
  },
  submissionFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s8,
  },
  submissionFilterChip: {
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.s12,
    borderRadius: RADIUS.pill,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  submissionFilterChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.secondarySoft,
  },
  submissionFilterText: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s12_5,
    color: COLORS.textSecondary,
  },
  submissionFilterTextActive: {
    fontFamily: FONT_FAMILY.bodyBold,
    color: COLORS.onSecondarySoft,
  },
  submissionCard: {
    gap: SPACING.s9,
    paddingTop: SPACING.s13,
    paddingHorizontal: SPACING.s13,
    paddingBottom: SPACING.s10,
    backgroundColor: COLORS.surface,
    borderWidth: BORDER_WIDTH.hairline,
    borderLeftWidth: BORDER_WIDTH.stripe,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
  },
  submissionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: SPACING.s8,
  },
  submissionTime: {
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s12,
    color: COLORS.textTertiary,
  },
  statusBadge: {
    marginLeft: 'auto',
    paddingHorizontal: SPACING.s8,
    paddingVertical: SPACING.s2,
    borderRadius: RADIUS.pill,
  },
  statusPending: {
    backgroundColor: COLORS.accentSoft,
  },
  statusApproved: {
    backgroundColor: COLORS.secondarySoft,
  },
  statusRejected: {
    backgroundColor: COLORS.surfaceMuted,
  },
  statusBadgeText: {
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s11_5,
    color: COLORS.textTitle,
  },
  submissionText: {
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14,
    lineHeight: LINE_HEIGHT.body,
    color: COLORS.textBody,
  },
  rejectionReason: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s12_5,
    color: COLORS.danger,
  },
  submissionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s16,
    paddingTop: SPACING.s4,
  },
  submissionActionButton: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s6,
  },
  submissionEditText: {
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s13,
    color: COLORS.primary,
  },
  submissionDeleteText: {
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s13,
    color: COLORS.danger,
  },
  separator: {
    height: SPACING.s14,
  },
});
