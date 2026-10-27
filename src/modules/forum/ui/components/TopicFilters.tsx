import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ForumFilter } from '@/modules/forum/domain/models/ForumCategory';
import { CATEGORY_COLORS, COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SPACING } from '@/shared/theme';

import { FORUM_STRINGS } from '../strings';

const FILTERS: { key: ForumFilter; label: string }[] = [
  { key: 'all', label: FORUM_STRINGS.filters.all },
  { key: 'announcements', label: FORUM_STRINGS.filters.announcements },
  { key: 'questions', label: FORUM_STRINGS.filters.questions },
  { key: 'guides', label: FORUM_STRINGS.filters.guides },
  { key: 'achievements', label: FORUM_STRINGS.filters.achievements },
];

type TopicFiltersProps = {
  selected: ForumFilter;
  onSelect: (filter: ForumFilter) => void;
};

export function TopicFilters({ selected, onSelect }: TopicFiltersProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        accessibilityLabel={FORUM_STRINGS.topicsAccessibilityLabel}
      >
        {FILTERS.map((filter) => {
          const isSelected = filter.key === selected;
          const palette = filter.key === 'all' ? null : CATEGORY_COLORS[filter.key];
          const borderColor = palette?.main ?? COLORS.primary;
          const textColor = palette?.onSoft ?? COLORS.primary;
          const selectedTextColor = filter.key === 'announcements' ? COLORS.text : COLORS.onPrimary;

          return (
            <Pressable
              key={filter.key}
              accessibilityRole="button"
              accessibilityLabel={FORUM_STRINGS.filterAccessibilityLabel(filter.label)}
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(filter.key)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: isSelected ? borderColor : COLORS.surface,
                  borderColor,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.label, { color: isSelected ? selectedTextColor : textColor }]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.s8,
  },
  content: {
    alignItems: 'center',
    gap: SPACING.s8,
    paddingHorizontal: SPACING.s16,
  },
  chip: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.s12,
  },
  label: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.s12_5,
  },
  pressed: {
    opacity: 0.75,
  },
});
