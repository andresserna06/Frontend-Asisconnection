import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RoleBadge } from '@/modules/auth';
import { useMyFollowers } from '@/modules/profile/application/useMyFollowers';
import type { PublicProfile } from '@/modules/profile/domain/models/PublicProfile';
import { usePublicProfileService } from '@/modules/profile/usePublicProfileService';
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
import { Avatar, getAvatarTone } from '@/shared/ui/atoms/Avatar';
import { Icon } from '@/shared/ui/atoms/Icon';
import { HeaderTeal } from '@/shared/ui/organisms/HeaderTeal';
import { ResponsiveScreen } from '@/shared/ui/templates/ResponsiveScreen';

import { StatusMessage } from './components/StatusMessage';
import { PROFILE_STRINGS } from './strings';

const HEADER_ROW_HEIGHT = 66;

export function FollowersScreen() {
  const insets = useSafeAreaInsets();
  const service = usePublicProfileService();
  const followers = useMyFollowers(service);

  function handleOpenFollower(follower: PublicProfile) {
    router.push({ pathname: '/users/[userId]', params: { userId: follower.id } });
  }

  return (
    <ResponsiveScreen>
      <View style={styles.screen}>
        <HeaderTeal
          title={PROFILE_STRINGS.followers.header}
          headerHeight={insets.top + HEADER_ROW_HEIGHT}
          paddingTop={insets.top + SPACING.s8}
          leftAccessory={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={PROFILE_STRINGS.followers.back}
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Icon name="chevron-left" size={SIZE.icon} color={COLORS.onPrimary} />
            </Pressable>
          }
          rightAccessory={null}
        />

        {followers.status === 'loading' ? (
          <StatusMessage kind="loading" />
        ) : followers.status === 'error' ? (
          <StatusMessage
            kind="error"
            message={PROFILE_STRINGS.followers.error}
            onRetry={followers.reload}
          />
        ) : (
          <FlatList
            data={followers.data}
            keyExtractor={(follower) => follower.id}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={PROFILE_STRINGS.followers.open(item.fullName)}
                onPress={() => handleOpenFollower(item)}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              >
                <Avatar
                  name={item.fullName}
                  photoUrl={item.photoUrl}
                  size="small"
                  tone={getAvatarTone(item.id)}
                />
                <View style={styles.details}>
                  <Text numberOfLines={1} style={styles.name}>
                    {item.fullName}
                  </Text>
                  <RoleBadge roles={item.roles} />
                </View>
                <Icon name="chevron-right" size={SIZE.iconSmall} color={COLORS.textSecondary} />
              </Pressable>
            )}
            ListEmptyComponent={
              <StatusMessage kind="message" message={PROFILE_STRINGS.followers.empty} />
            }
            ItemSeparatorComponent={Separator}
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.s24 }]}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ResponsiveScreen>
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
  row: {
    minHeight: SIZE.button,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s12,
    padding: SPACING.s14,
    backgroundColor: COLORS.surface,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
  },
  details: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
    gap: SPACING.s4,
  },
  name: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.headingBold,
    fontSize: FONT_SIZE.s16,
  },
  separator: {
    height: SPACING.s10,
  },
});
