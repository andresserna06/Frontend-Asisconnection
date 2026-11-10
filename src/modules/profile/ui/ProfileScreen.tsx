import { useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { useMyProfile } from '@/modules/profile/application/useMyProfile';
import { toProfileError } from '@/modules/profile/domain/models/ProfileError';
import type { Post } from '@/shared/domain/models/Post';
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

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const service = useProfileService();
  const { profile, posts, activeTab, selectTab } = useMyProfile(service);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  async function handleChangePhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission?.granted) {
      Alert.alert(
        'Permiso necesario',
        'Se requiere acceso a la galería para cambiar tu foto de perfil.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const uploadedUrl = service.uploadAvatar
        ? await service.uploadAvatar(result.assets[0].uri)
        : result.assets[0].uri;
      if (service.updateMyProfile) {
        await service.updateMyProfile({ avatarUrl: uploadedUrl });
      }
      profile.reload();
    } catch {
      Alert.alert('Error', 'No fue posible subir la foto. Intenta nuevamente.');
    } finally {
      setIsUploadingPhoto(false);
    }
  }

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
        isUploading={isUploadingPhoto}
        onChangePhoto={handleChangePhoto}
      />
      <StatsCard
        postCount={me.postCount}
        followerCount={me.followerCount}
        followingCount={me.followingCount}
      />
      <InfoCard
        profile={me}
        onEdit={showComingSoonNotice}
        onOpenSettings={() => router.push('/profile/settings')}
      />
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
