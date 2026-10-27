import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ProfileTab } from '@/modules/profile/application/useMyProfile';
import { PROFILE_STRINGS } from '@/modules/profile/ui/strings';
import { BORDER_WIDTH, COLORS, FONT_FAMILY, FONT_SIZE, SIZE, SPACING } from '@/shared/theme';

type ProfileTabsProps = {
  activeTab: ProfileTab;
  postCount: number;
  savedCount: number;
  onSelect: (tab: ProfileTab) => void;
};

// "Publicaciones (n)" and "Guardados (n)". The selected one is green and underlined.
export function ProfileTabs({ activeTab, postCount, savedCount, onSelect }: ProfileTabsProps) {
  const tabs: { key: ProfileTab; label: string }[] = [
    { key: 'posts', label: PROFILE_STRINGS.tabs.posts(postCount) },
    { key: 'saved', label: PROFILE_STRINGS.tabs.saved(savedCount) },
  ];

  return (
    <View accessibilityRole="tablist" style={styles.container}>
      {tabs.map(({ key, label }) => {
        const isSelected = key === activeTab;
        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(key)}
            style={[styles.tab, isSelected && styles.selectedTab]}
          >
            <Text style={[styles.label, isSelected && styles.selectedLabel]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: SPACING.s4,
    borderBottomWidth: BORDER_WIDTH.hairline,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    height: SIZE.tab,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: BORDER_WIDTH.indicator,
    borderBottomColor: 'transparent',
  },
  selectedTab: {
    borderBottomColor: COLORS.primary,
  },
  label: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s14_5,
    color: COLORS.textSecondary,
  },
  selectedLabel: {
    color: COLORS.primary,
  },
});
