import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ROLES, RoleBadge, type RoleCode } from '@/modules/auth';
import { useMyFollowers } from '@/modules/profile/application/useMyFollowers';
import type {
  ActorConnectionItem,
  PublicProfile,
} from '@/modules/profile/domain/models/PublicProfile';
import { usePublicProfileService } from '@/modules/profile/usePublicProfileService';
import { useAsyncData } from '@/shared/hooks/useAsyncData';
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

type FollowersTab = 'followers' | 'following' | 'requests' | 'directory';

const DIRECTORY_ROLES: { key: RoleCode | undefined; label: string }[] = [
  { key: undefined, label: PROFILE_STRINGS.followers.roleFilterAll },
  { key: 'ACUDIENTE', label: ROLES.ACUDIENTE.label },
  { key: 'VOLUNTARIO', label: ROLES.VOLUNTARIO.label },
  { key: 'BENEFICIARIO', label: ROLES.BENEFICIARIO.label },
  { key: 'INVERSOR', label: ROLES.INVERSOR.label },
];

export function FollowersScreen() {
  const insets = useSafeAreaInsets();
  const params = (useLocalSearchParams?.() ?? {}) as { actorId?: string; tab?: string };
  const actorId = params.actorId;
  const initialTab: FollowersTab =
    params.tab === 'following' || params.tab === 'requests' || params.tab === 'directory'
      ? params.tab
      : 'followers';
  const [activeTab, setActiveTab] = useState<FollowersTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleCode | undefined>(undefined);
  const service = usePublicProfileService();
  const followers = useMyFollowers(service, actorId);

  const loadFollowing = useCallback(async (): Promise<PublicProfile[]> => {
    if (activeTab !== 'following') {
      return [];
    }
    if (actorId && service.getActorFollowing) {
      return service.getActorFollowing(actorId);
    }
    return service.getMyFollowing ? service.getMyFollowing() : [];
  }, [activeTab, actorId, service]);

  const loadRequests = useCallback(async (): Promise<ActorConnectionItem[]> => {
    if (activeTab !== 'requests' || !service.getMyConnections) {
      return [];
    }
    return service.getMyConnections({ status: 'PENDING', direction: 'incoming' });
  }, [activeTab, service]);

  const loadDirectory = useCallback(async (): Promise<PublicProfile[]> => {
    if (activeTab !== 'directory' || !service.searchActors) {
      return [];
    }
    return service.searchActors({
      search: searchQuery,
      role: selectedRole,
    });
  }, [activeTab, searchQuery, selectedRole, service]);

  const following = useAsyncData(loadFollowing);
  const requests = useAsyncData(loadRequests);
  const directory = useAsyncData(loadDirectory);

  const hasExtendedTabs =
    typeof service.getMyFollowing === 'function' ||
    typeof service.getActorFollowing === 'function' ||
    typeof service.getMyConnections === 'function' ||
    typeof service.searchActors === 'function';

  const tabs: { key: FollowersTab; label: string }[] = [
    { key: 'followers', label: PROFILE_STRINGS.followers.tabs.followers },
    { key: 'following', label: PROFILE_STRINGS.followers.tabs.following },
    ...(!actorId && typeof service.getMyConnections === 'function'
      ? [{ key: 'requests' as const, label: PROFILE_STRINGS.followers.tabs.requests }]
      : []),
    ...(!actorId && typeof service.searchActors === 'function'
      ? [{ key: 'directory' as const, label: PROFILE_STRINGS.followers.tabs.directory }]
      : []),
  ];

  function handleOpenProfile(targetId: string) {
    router.push({ pathname: '/users/[userId]', params: { userId: targetId } });
  }

  async function handleAcceptRequest(connectionId: string) {
    if (!service.acceptConnection) {
      return;
    }
    try {
      await service.acceptConnection(connectionId);
      requests.refresh();
      followers.refresh();
      following.refresh();
    } catch {
      // Ignore transient action failure.
    }
  }

  async function handleRejectRequest(connectionId: string) {
    if (!service.deleteConnection) {
      return;
    }
    try {
      await service.deleteConnection(connectionId);
      requests.refresh();
      followers.refresh();
      following.refresh();
    } catch {
      // Ignore transient action failure.
    }
  }

  const headerTitle =
    activeTab === 'following'
      ? PROFILE_STRINGS.followers.followingHeader
      : activeTab === 'requests'
        ? PROFILE_STRINGS.followers.requestsHeader
        : activeTab === 'directory'
          ? PROFILE_STRINGS.followers.directoryHeader
          : PROFILE_STRINGS.followers.header;

  const activeProfilesList =
    activeTab === 'following' ? following : activeTab === 'directory' ? directory : followers;

  const emptyProfilesMessage =
    activeTab === 'following'
      ? PROFILE_STRINGS.followers.emptyFollowing
      : activeTab === 'directory'
        ? PROFILE_STRINGS.followers.emptyDirectory
        : PROFILE_STRINGS.followers.empty;

  return (
    <ResponsiveScreen>
      <View style={styles.screen}>
        <HeaderTeal
          title={headerTitle}
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

        {hasExtendedTabs ? (
          <View accessibilityRole="tablist" style={styles.tabsBar}>
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  accessibilityRole="tab"
                  accessibilityLabel={tab.label}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setActiveTab(tab.key)}
                  style={({ pressed }) => [
                    styles.tab,
                    isSelected && styles.activeTab,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.tabText, isSelected && styles.activeTabText]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {activeTab === 'directory' ? (
          <View style={styles.directoryFilters}>
            <View style={styles.searchBar}>
              <Icon name="search" size={SIZE.iconSmall} color={COLORS.textTertiary} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={PROFILE_STRINGS.followers.searchPlaceholder}
                placeholderTextColor={COLORS.textTertiary}
                accessibilityLabel={PROFILE_STRINGS.followers.searchLabel}
                style={styles.searchInput}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.roleChips}
            >
              {DIRECTORY_ROLES.map((item) => {
                const isSelected = selectedRole === item.key;
                return (
                  <Pressable
                    key={item.key ?? 'all'}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setSelectedRole(item.key)}
                    style={({ pressed }) => [
                      styles.roleChip,
                      isSelected && styles.roleChipActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.roleChipText, isSelected && styles.roleChipTextActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {activeTab === 'requests' ? (
          requests.status === 'loading' ? (
            <StatusMessage kind="loading" />
          ) : requests.status === 'error' ? (
            <StatusMessage
              kind="error"
              message={PROFILE_STRINGS.followers.error}
              onRetry={requests.reload}
            />
          ) : (
            <FlatList<ActorConnectionItem>
              data={requests.data}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const peerName = item.peerActor?.displayName ?? item.requesterActorId;
                const peerId = item.peerActor?.actorId ?? item.requesterActorId;
                const peerRoles = item.peerActor?.roles ?? [];
                const peerPhoto = item.peerActor?.photoUrl ?? null;

                return (
                  <View style={styles.requestCard}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={PROFILE_STRINGS.followers.open(peerName)}
                      onPress={() => handleOpenProfile(peerId)}
                      style={({ pressed }) => [styles.requestIdentity, pressed && styles.pressed]}
                    >
                      <Avatar
                        name={peerName}
                        photoUrl={peerPhoto}
                        size="small"
                        tone={getAvatarTone(peerId)}
                      />
                      <View style={styles.details}>
                        <Text numberOfLines={1} style={styles.name}>
                          {peerName}
                        </Text>
                        {peerRoles.length > 0 ? <RoleBadge roles={peerRoles} /> : null}
                      </View>
                    </Pressable>
                    <View style={styles.requestActions}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={PROFILE_STRINGS.followers.acceptRequest}
                        onPress={() => void handleAcceptRequest(item.id)}
                        style={({ pressed }) => [styles.acceptButton, pressed && styles.pressed]}
                      >
                        <Text style={styles.acceptButtonText}>
                          {PROFILE_STRINGS.followers.acceptRequest}
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={PROFILE_STRINGS.followers.rejectRequest}
                        onPress={() => void handleRejectRequest(item.id)}
                        style={({ pressed }) => [styles.rejectButton, pressed && styles.pressed]}
                      >
                        <Text style={styles.rejectButtonText}>
                          {PROFILE_STRINGS.followers.rejectRequest}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={
                <StatusMessage kind="message" message={PROFILE_STRINGS.followers.emptyRequests} />
              }
              ItemSeparatorComponent={Separator}
              contentContainerStyle={[
                styles.content,
                { paddingBottom: insets.bottom + SPACING.s24 },
              ]}
              showsVerticalScrollIndicator={false}
            />
          )
        ) : activeProfilesList.status === 'loading' ? (
          <StatusMessage kind="loading" />
        ) : activeProfilesList.status === 'error' ? (
          <StatusMessage
            kind="error"
            message={PROFILE_STRINGS.followers.error}
            onRetry={activeProfilesList.reload}
          />
        ) : (
          <FlatList<PublicProfile>
            data={activeProfilesList.data}
            keyExtractor={(follower) => follower.id}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={PROFILE_STRINGS.followers.open(item.fullName)}
                onPress={() => handleOpenProfile(item.id)}
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
            ListEmptyComponent={<StatusMessage kind="message" message={emptyProfilesMessage} />}
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
  tabsBar: {
    flexDirection: 'row',
    gap: SPACING.s8,
    paddingHorizontal: SPACING.s20,
    paddingTop: SPACING.s14,
  },
  tab: {
    flex: 1,
    minHeight: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.headerButton,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  activeTab: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s13,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.onPrimary,
  },
  directoryFilters: {
    gap: SPACING.s10,
    paddingHorizontal: SPACING.s20,
    paddingTop: SPACING.s14,
  },
  searchBar: {
    minHeight: SIZE.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s8,
    paddingHorizontal: SPACING.s14,
    borderRadius: RADIUS.pill,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: SPACING.s8,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14,
    color: COLORS.text,
  },
  roleChips: {
    gap: SPACING.s8,
  },
  roleChip: {
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.s12,
    borderRadius: RADIUS.pill,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  roleChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.secondarySoft,
  },
  roleChipText: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s12_5,
    color: COLORS.textSecondary,
  },
  roleChipTextActive: {
    fontFamily: FONT_FAMILY.bodyBold,
    color: COLORS.onSecondarySoft,
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
  requestCard: {
    gap: SPACING.s12,
    padding: SPACING.s14,
    backgroundColor: COLORS.surface,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
  },
  requestIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s12,
  },
  requestActions: {
    flexDirection: 'row',
    gap: SPACING.s10,
  },
  acceptButton: {
    flex: 1,
    minHeight: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.primary,
  },
  acceptButtonText: {
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s14,
    color: COLORS.onPrimary,
  },
  rejectButton: {
    flex: 1,
    minHeight: SIZE.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.button,
    borderWidth: BORDER_WIDTH.hairline,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  rejectButtonText: {
    fontFamily: FONT_FAMILY.bodyBold,
    fontSize: FONT_SIZE.s14,
    color: COLORS.textSecondary,
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
