import { ScrollView, StyleSheet, View } from 'react-native';

import type { ForumFilter } from '@/modules/forum/domain/models/ForumCategory';
import type { CategoryKey } from '@/shared/theme';
import { COLORS, SPACING } from '@/shared/theme';
import { CategoryChip } from '@/shared/ui/atoms/CategoryChip';

import { FORUM_STRINGS } from '../strings';

const FILTERS: { key: ForumFilter; category: CategoryKey | null; label: string }[] = [
  { key: 'all', category: null, label: FORUM_STRINGS.filters.all },
  { key: 'announcements', category: 'announcements', label: FORUM_STRINGS.filters.announcements },
  { key: 'questions', category: 'questions', label: FORUM_STRINGS.filters.questions },
  { key: 'guides', category: 'guides', label: FORUM_STRINGS.filters.guides },
  { key: 'achievements', category: 'achievements', label: FORUM_STRINGS.filters.achievements },
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
          return (
            <CategoryChip
              key={filter.key}
              label={filter.label}
              accessibilityLabel={FORUM_STRINGS.filterAccessibilityLabel(filter.label)}
              category={filter.category}
              variant="filter"
              isSelected={isSelected}
              onPress={() => onSelect(filter.key)}
            />
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
});
