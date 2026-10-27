import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { STRINGS } from '@/shared/config/strings';
import { COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SIZE, SPACING } from '@/shared/theme';
import { Icon, type IconName } from '@/shared/ui/atoms/Icon';

export type BottomNavRoute = 'index' | 'ecosystem' | 'assistant' | 'profile';

type NavigationItem = {
  route: BottomNavRoute;
  label: string;
  icon: IconName;
};

const NAVIGATION_ITEMS: NavigationItem[] = [
  { route: 'index', label: STRINGS.navigation.forums, icon: 'message-circle' },
  { route: 'ecosystem', label: STRINGS.navigation.ecosystem, icon: 'grid' },
  { route: 'assistant', label: STRINGS.navigation.assistant, icon: 'star' },
  { route: 'profile', label: STRINGS.navigation.profile, icon: 'user' },
];

type BottomNavBarProps = {
  activeRoute: string;
  profileInitials: string;
  onNavigate: (route: BottomNavRoute) => void;
};

export function BottomNavBar({ activeRoute, profileInitials, onNavigate }: BottomNavBarProps) {
  const insets = useSafeAreaInsets();
  const selectedRoute = activeRoute === 'notifications' ? 'index' : activeRoute;

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, SPACING.s10) }]}
    >
      {NAVIGATION_ITEMS.map((item) => {
        const isSelected = selectedRoute === item.route;

        return (
          <Pressable
            key={item.route}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onNavigate(item.route)}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            {item.route === 'profile' ? (
              <View style={[styles.profileAvatar, isSelected && styles.selectedAvatar]}>
                <Text style={styles.profileInitials}>{profileInitials}</Text>
              </View>
            ) : (
              <Icon
                name={item.icon}
                size={SIZE.icon}
                color={isSelected ? COLORS.primary : COLORS.textSecondary}
              />
            )}
            <Text style={[styles.label, isSelected && styles.selectedLabel]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.s12,
    paddingTop: SPACING.s8,
    backgroundColor: COLORS.surface,
  },
  tab: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.s3,
    borderRadius: RADIUS.control,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s10_5,
  },
  selectedLabel: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bodySemiBold,
  },
  profileAvatar: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.accent,
  },
  selectedAvatar: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  profileInitials: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s9_5,
  },
});
