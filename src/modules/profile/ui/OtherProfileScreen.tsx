import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RoleBadge, useAuth } from '@/modules/auth';
import { usePublicProfileConnection } from '@/modules/profile/application/usePublicProfileConnection';
import { usePublicProfile } from '@/modules/profile/application/usePublicProfile';
import type { PublicProfileErrorKind } from '@/modules/profile/domain/models/PublicProfileError';
import { usePublicProfileService } from '@/modules/profile/usePublicProfileService';
import { useCollapsingHeader } from '@/shared/hooks/useCollapsingHeader';
import { formatLongDate } from '@/shared/lib/formatDate';
import {
  BORDER_WIDTH,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  RADIUS,
  SIZE,
  SPACING,
} from '@/shared/theme';
import { Avatar } from '@/shared/ui/atoms/Avatar';
import { Icon } from '@/shared/ui/atoms/Icon';
import { HeaderTeal } from '@/shared/ui/organisms/HeaderTeal';
import { ResponsiveScreen } from '@/shared/ui/templates/ResponsiveScreen';

import { ProfilePostCard } from './components/ProfilePostCard';
import { StatsCard } from './components/StatsCard';
import { StatusMessage } from './components/StatusMessage';
import { PROFILE_STRINGS } from './strings';

const HEADER_ROW_HEIGHT = 66;

export function OtherProfileScreen() {
  const insets = useSafeAreaInsets();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { isAnonymous, signOut } = useAuth();
  const service = usePublicProfileService();
  const { profile, reload, adjustFollowerCount, posts } = usePublicProfile(service, userId);
  const follow = usePublicProfileConnection(service, userId, isAnonymous);
  const expandedHeaderHeight = insets.top + HEADER_ROW_HEIGHT;
  const { headerHeight, onScroll } = useCollapsingHeader(expandedHeaderHeight);
  const hasActorPostsSupport = typeof service.getActorPosts === 'function';

  // A pending request does not count as a follower until it is accepted.
  async function handleFollow() {
    if ((await follow.requestFollow()) === 'following') {
      adjustFollowerCount(1);
    }
  }

  async function handleUnfollow() {
    if ((await follow.requestUnfollow()) === 'notFollowing') {
      adjustFollowerCount(-1);
    }
  }

  function handleRetry() {
    reload();
  }

  async function handleSignIn() {
    await signOut();
    router.replace('/login');
  }

  return (
    <ResponsiveScreen>
      <View style={styles.screen}>
        <HeaderTeal
          title={PROFILE_STRINGS.publicProfile.header}
          headerHeight={headerHeight}
          paddingTop={insets.top + SPACING.s8}
          leftAccessory={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={PROFILE_STRINGS.publicProfile.back}
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Icon name="chevron-left" size={SIZE.icon} color={COLORS.onPrimary} />
            </Pressable>
          }
          rightAccessory={null}
        />
        {profile.status === 'loading' ? (
          <View style={styles.state}>
            <ActivityIndicator
              accessibilityLabel={PROFILE_STRINGS.publicProfile.loading}
              color={COLORS.primary}
            />
            <Text style={styles.stateText}>{PROFILE_STRINGS.publicProfile.loading}</Text>
          </View>
        ) : profile.status === 'error' ? (
          <View style={styles.state}>
            <Text accessibilityRole="alert" style={styles.stateText}>
              {getPublicProfileErrorMessage(profile.error.kind)}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={PROFILE_STRINGS.publicProfile.retry}
              onPress={handleRetry}
              style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            >
              <Text style={styles.retryText}>{PROFILE_STRINGS.publicProfile.retry}</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACING.s18 }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.identity}>
              <Avatar name={profile.data.fullName} photoUrl={profile.data.photoUrl} size="large" />
              <View style={styles.identityDetails}>
                <Text accessibilityRole="header" style={styles.name}>
                  {profile.data.fullName}
                </Text>
                {profile.data.roles.length > 0 ? <RoleBadge roles={profile.data.roles} /> : null}
                {profile.data.shortBio ? (
                  <Text style={styles.bio}>{profile.data.shortBio}</Text>
                ) : null}
              </View>
            </View>

            <StatsCard
              postCount={profile.data.postCount}
              followerCount={profile.data.followerCount}
              followingCount={profile.data.followingCount}
            />

            <FollowAction
              connection={follow.connection}
              isRequesting={follow.isRequesting}
              operationError={follow.operationError?.kind ?? null}
              onFollow={() => void handleFollow()}
              onUnfollow={() => void handleUnfollow()}
              onRetry={() => void follow.retryConnectionStatus()}
              onSignIn={() => void handleSignIn()}
            />

            {profile.data.city !== null || profile.data.birthDate !== null ? (
              <View style={styles.infoCard}>
                <Text accessibilityRole="header" style={styles.sectionTitle}>
                  {PROFILE_STRINGS.publicProfile.info}
                </Text>
                {profile.data.city !== null ? (
                  <ProfileDataRow label={PROFILE_STRINGS.info.city} value={profile.data.city} />
                ) : null}
                {profile.data.birthDate !== null ? (
                  <ProfileDataRow
                    label={PROFILE_STRINGS.info.birthDate}
                    value={formatLongDate(profile.data.birthDate)}
                  />
                ) : null}
              </View>
            ) : null}

            <View style={styles.publications}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>
                {PROFILE_STRINGS.publicProfile.posts(profile.data.postCount)}
              </Text>
              {!hasActorPostsSupport ? (
                <Text style={styles.stateText}>
                  {PROFILE_STRINGS.publicProfile.postsUnavailable}
                </Text>
              ) : posts.status === 'loading' ? (
                <StatusMessage kind="loading" />
              ) : posts.status === 'error' ? (
                <StatusMessage
                  kind="error"
                  message={PROFILE_STRINGS.listError}
                  onRetry={posts.reload}
                />
              ) : posts.data.length === 0 ? (
                <Text style={styles.stateText}>{PROFILE_STRINGS.publicProfile.postsEmpty}</Text>
              ) : (
                <View style={styles.postsList}>
                  {posts.data.map((post) => (
                    <ProfilePostCard
                      key={post.id}
                      post={post}
                      isAuthorShown={false}
                      onPress={() =>
                        router.push({
                          pathname: '/users/[userId]/posts/[postId]',
                          params: { userId, postId: post.id },
                        })
                      }
                    />
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </ResponsiveScreen>
  );
}

type FollowActionProps = {
  connection:
    | 'signInRequired'
    | {
        status: 'loading';
        actorId: string;
      }
    | {
        status: 'ready';
        actorId: string;
        relationship: 'notFollowing' | 'pending' | 'following' | 'blocked';
      }
    | {
        status: 'error';
        actorId: string;
        error: { kind: PublicProfileErrorKind };
      }
    | null;
  isRequesting: boolean;
  operationError: PublicProfileErrorKind | null;
  onFollow: () => void;
  onUnfollow: () => void;
  onRetry: () => void;
  onSignIn: () => void;
};

function FollowAction({
  connection,
  isRequesting,
  operationError,
  onFollow,
  onUnfollow,
  onRetry,
  onSignIn,
}: FollowActionProps) {
  if (connection === null) {
    return null;
  }

  if (connection === 'signInRequired') {
    return <FollowButton label={PROFILE_STRINGS.publicProfile.signInToFollow} onPress={onSignIn} />;
  }

  if (connection.status === 'loading') {
    return (
      <View style={styles.followLoading}>
        <ActivityIndicator
          accessibilityLabel={PROFILE_STRINGS.publicProfile.checkingFollow}
          color={COLORS.primary}
        />
      </View>
    );
  }

  if (connection.status === 'error') {
    return (
      <View style={styles.followErrorContainer}>
        <Text accessibilityRole="alert" style={styles.followError}>
          {getFollowErrorMessage(connection.error.kind)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={PROFILE_STRINGS.publicProfile.retryFollow}
          onPress={onRetry}
          style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
        >
          <Text style={styles.retryText}>{PROFILE_STRINGS.publicProfile.retry}</Text>
        </Pressable>
      </View>
    );
  }

  const relationship = connection.relationship;
  const isFollowing = relationship === 'following';
  const label = isFollowing
    ? PROFILE_STRINGS.publicProfile.unfollow
    : relationship === 'pending'
      ? PROFILE_STRINGS.publicProfile.requestSent
      : relationship === 'blocked'
        ? PROFILE_STRINGS.publicProfile.blocked
        : PROFILE_STRINGS.publicProfile.follow;
  const isDisabled = isRequesting || (relationship !== 'notFollowing' && !isFollowing);

  return (
    <View style={styles.followContainer}>
      <FollowButton
        label={label}
        variant={isFollowing ? 'following' : 'primary'}
        isLoading={isRequesting}
        isDisabled={isDisabled}
        onPress={isFollowing ? onUnfollow : onFollow}
      />
      {operationError !== null ? (
        <Text accessibilityRole="alert" style={styles.followError}>
          {getFollowErrorMessage(operationError)}
        </Text>
      ) : null}
    </View>
  );
}

type FollowButtonProps = {
  label: string;
  variant?: 'primary' | 'following';
  isDisabled?: boolean;
  isLoading?: boolean;
  onPress: () => void;
};

function FollowButton({
  label,
  variant = 'primary',
  isDisabled = false,
  isLoading = false,
  onPress,
}: FollowButtonProps) {
  const isFollowingVariant = variant === 'following';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.followButton,
        isFollowingVariant && styles.followButtonFollowing,
        isDisabled && styles.followButtonDisabled,
        pressed && styles.pressed,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={isFollowingVariant ? COLORS.primary : COLORS.onPrimary} />
      ) : (
        <Text
          style={[styles.followButtonText, isFollowingVariant && styles.followButtonTextFollowing]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

type ProfileDataRowProps = {
  label: string;
  value: string;
};

function ProfileDataRow({ label, value }: ProfileDataRowProps) {
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue}>{value}</Text>
    </View>
  );
}

function getPublicProfileErrorMessage(kind: PublicProfileErrorKind): string {
  return PROFILE_STRINGS.publicProfile.errors[kind];
}

function getFollowErrorMessage(kind: PublicProfileErrorKind): string {
  return PROFILE_STRINGS.publicProfile.followErrors[kind];
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
    opacity: 0.7,
  },
  content: {
    gap: SPACING.s14,
    paddingHorizontal: SPACING.s20,
    paddingBottom: SPACING.s24,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s16,
  },
  identityDetails: {
    flex: 1,
    alignItems: 'flex-start',
    gap: SPACING.s6,
  },
  name: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s22,
  },
  bio: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14,
  },
  followContainer: {
    gap: SPACING.s8,
  },
  followButton: {
    minHeight: SIZE.buttonSecondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BORDER_WIDTH.strong,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.primary,
  },
  followButtonFollowing: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  followButtonDisabled: {
    opacity: 0.75,
  },
  followButtonText: {
    color: COLORS.onPrimary,
    fontFamily: FONT_FAMILY.headingBold,
    fontSize: FONT_SIZE.s16,
  },
  followButtonTextFollowing: {
    color: COLORS.primary,
  },
  followLoading: {
    minHeight: SIZE.buttonSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followErrorContainer: {
    alignItems: 'center',
    gap: SPACING.s8,
  },
  followError: {
    color: COLORS.danger,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s13,
    textAlign: 'center',
  },
  infoCard: {
    paddingTop: SPACING.s14,
    paddingHorizontal: SPACING.s16,
    paddingBottom: SPACING.s4,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
  },
  sectionTitle: {
    paddingBottom: SPACING.s4,
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s16,
  },
  dataRow: {
    minHeight: SIZE.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.s14,
    borderTopWidth: BORDER_WIDTH.hairline,
    borderTopColor: COLORS.surfaceMuted,
  },
  dataLabel: {
    color: COLORS.textTertiary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s13,
  },
  dataValue: {
    flexShrink: 1,
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s14,
    textAlign: 'right',
  },
  publications: {
    gap: SPACING.s8,
    paddingTop: SPACING.s4,
  },
  postsList: {
    gap: SPACING.s14,
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.s12,
    paddingHorizontal: SPACING.s24,
  },
  stateText: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s15,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.s20,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.primary,
  },
  retryText: {
    color: COLORS.onPrimary,
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s14,
  },
});
