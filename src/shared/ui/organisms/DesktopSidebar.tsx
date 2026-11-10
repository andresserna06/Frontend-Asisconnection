import { Image } from 'expo-image';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { STRINGS } from '@/shared/config/strings';
import {
  BORDER_WIDTH,
  COLORS,
  DESKTOP_LAYOUT,
  FONT_FAMILY,
  FONT_SIZE,
  RADIUS,
  SIZE,
  SPACING,
} from '@/shared/theme';
import { Button } from '@/shared/ui/atoms/Button';
import { Icon, type IconName } from '@/shared/ui/atoms/Icon';

const LOGO = require('@/assets/images/logo-asisco-up.png');

const LOGO_WIDTH = 148;
const LOGO_ASPECT_RATIO = 2450 / 900;

export type DesktopNavRoute = 'index' | 'ecosystem' | 'assistant' | 'profile';

type NavigationItem = {
  route: DesktopNavRoute;
  label: string;
  icon: IconName;
};

const NAVIGATION_ITEMS: NavigationItem[] = [
  { route: 'index', label: STRINGS.navigation.forums, icon: 'message-circle' },
  { route: 'ecosystem', label: STRINGS.navigation.ecosystem, icon: 'grid' },
  { route: 'assistant', label: STRINGS.navigation.assistant, icon: 'star' },
  { route: 'profile', label: STRINGS.navigation.profile, icon: 'user' },
];

export function toDesktopNavRoute(pathname: string): DesktopNavRoute | null {
  // Notifications open from the forum, so that section stays selected (as in the bottom bar).
  if (
    pathname === '/' ||
    pathname.startsWith('/comments') ||
    pathname.startsWith('/posts') ||
    pathname.startsWith('/notifications')
  ) {
    return 'index';
  }
  if (pathname.startsWith('/profile') || pathname.startsWith('/admin')) {
    return 'profile';
  }
  if (pathname.startsWith('/ecosystem')) {
    return 'ecosystem';
  }
  if (pathname.startsWith('/assistant')) {
    return 'assistant';
  }
  return null;
}

type DesktopSidebarProps = {
  activeRoute: DesktopNavRoute | null;
  profileInitials: string;
  onNavigate: (route: DesktopNavRoute) => void;
  onCreatePost: () => void;
};

export function DesktopSidebar({
  activeRoute,
  profileInitials,
  onNavigate,
  onCreatePost,
}: DesktopSidebarProps) {
  return (
    <View style={styles.sidebar}>
      <Image
        source={LOGO}
        style={styles.logo}
        contentFit="contain"
        accessible
        accessibilityLabel={STRINGS.appName}
      />
      <View role="navigation" accessibilityLabel={STRINGS.navigation.main} style={styles.items}>
        {NAVIGATION_ITEMS.map((item) => (
          <SidebarItem
            key={item.route}
            label={item.label}
            isSelected={activeRoute === item.route}
            onPress={() => onNavigate(item.route)}
            icon={
              item.route === 'profile' ? (
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileInitials}>{profileInitials}</Text>
                </View>
              ) : (
                <Icon
                  name={item.icon}
                  size={SIZE.icon}
                  color={activeRoute === item.route ? COLORS.primary : COLORS.textSecondary}
                />
              )
            }
          />
        ))}
      </View>
      <Button label={STRINGS.navigation.createPost} iconRight="plus" onPress={onCreatePost} />
    </View>
  );
}

type SidebarItemProps = {
  label: string;
  icon: ReactNode;
  isSelected: boolean;
  onPress: () => void;
};

function SidebarItem({ label, icon, isSelected, onPress }: SidebarItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[styles.item, isHovered && styles.itemHovered, isSelected && styles.itemSelected]}
    >
      {icon}
      <Text style={[styles.itemLabel, isSelected && styles.itemLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: DESKTOP_LAYOUT.sidebarWidth,
    flexShrink: 0,
    gap: SPACING.s20,
    paddingHorizontal: SPACING.s16,
    paddingVertical: SPACING.s24,
    borderRightWidth: BORDER_WIDTH.hairline,
    borderRightColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  logo: {
    width: LOGO_WIDTH,
    aspectRatio: LOGO_ASPECT_RATIO,
    marginHorizontal: SPACING.s8,
  },
  items: {
    gap: SPACING.s4,
  },
  item: {
    minHeight: SIZE.button,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s14,
    paddingHorizontal: SPACING.s14,
    borderRadius: RADIUS.button,
  },
  itemHovered: {
    backgroundColor: COLORS.background,
  },
  itemSelected: {
    backgroundColor: COLORS.secondarySoft,
  },
  itemLabel: {
    color: COLORS.textStrong,
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s16,
  },
  itemLabelSelected: {
    color: COLORS.onSecondarySoft,
    fontFamily: FONT_FAMILY.bodyBold,
  },
  profileAvatar: {
    width: SIZE.avatarSmall,
    height: SIZE.avatarSmall,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.accent,
  },
  profileInitials: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s10,
  },
});
