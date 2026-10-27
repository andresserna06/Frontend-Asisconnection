import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Post } from '@/modules/posts';
import { useMyProfile } from '@/modules/profile/application/useMyProfile';
import { toProfileError } from '@/modules/profile/domain/models/ProfileError';
import { PROFILE_ERROR_MESSAGES, PROFILE_STRINGS } from '@/modules/profile/ui/strings';
import { useProfileService } from '@/modules/profile/useProfileService';
import { showComingSoonNotice } from '@/shared/lib/showComingSoonNotice';
import { COLORS, SPACING } from '@/shared/theme';

import { InfoCard } from './components/InfoCard';
import { ProfilePostCard } from './components/ProfilePostCard';
import { ProfileSummary } from './components/ProfileSummary';
import { ProfileTabs } from './components/ProfileTabs';
import { StatsCard } from './components/StatsCard';
import { StatusMessage } from './components/StatusMessage';

// Own profile (mockups 05-Perfil and 05c-Perfil-guardados). The green header with the
// settings button and the bottom tab bar come from T-04/T-05: when they exist, wrap
// this content in that template and drop the top inset below.
export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const service = useProfileService();
  const { profile, posts, activeTab, selectTab } = useMyProfile(service);

  if (profile.status !== 'success') {
    return (
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
    );
  }

  const me = profile.data;
  const isSavedTab = activeTab === 'saved';

  const header = (
    <View style={styles.header}>
      <ProfileSummary
        fullName={me.fullName}
        roles={me.roles}
        photoUrl={me.photoUrl}
        onChangePhoto={showComingSoonNotice}
      />
      <StatsCard
        postCount={me.postCount}
        followerCount={me.followerCount}
        followingCount={me.followingCount}
      />
      {/* Settings arrives in T-12. */}
      <InfoCard profile={me} onEdit={showComingSoonNotice} onOpenSettings={showComingSoonNotice} />
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
    <FlatList<Post>
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACING.s18 }]}
      data={posts.status === 'success' ? posts.data : []}
      keyExtractor={(post) => post.id}
      renderItem={({ item }) => <ProfilePostCard post={item} isAuthorShown={isSavedTab} />}
      ListHeaderComponent={header}
      ListEmptyComponent={listStatus}
      ItemSeparatorComponent={Separator}
      showsVerticalScrollIndicator={false}
    />
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
  content: {
    paddingHorizontal: SPACING.s20,
    paddingBottom: SPACING.s24,
  },
  header: {
    gap: SPACING.s14,
    paddingBottom: SPACING.s14,
  },
  separator: {
    height: SPACING.s14,
  },
});
