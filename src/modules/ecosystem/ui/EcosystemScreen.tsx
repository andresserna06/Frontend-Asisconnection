import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from '@/shared/theme';

import { EcosystemCard } from './components/EcosystemCard';
import { ECOSYSTEM_STRINGS } from './strings';

export function EcosystemScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.s2 }]}>
        <Text accessibilityRole="header" style={styles.title}>
          {ECOSYSTEM_STRINGS.title}
        </Text>
        <Text style={styles.subtitle}>{ECOSYSTEM_STRINGS.subtitle}</Text>
      </View>

      <FlatList
        contentContainerStyle={styles.list}
        data={ECOSYSTEM_STRINGS.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EcosystemCard item={item} />}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={Separator}
      />
    </View>
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
  header: {
    gap: SPACING.s5,
    paddingHorizontal: SPACING.s20,
    paddingBottom: SPACING.s4,
  },
  title: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s25,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s13_5,
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: SPACING.s20,
    paddingTop: SPACING.s16,
    paddingBottom: SPACING.s20,
  },
  separator: {
    height: SPACING.s12,
  },
});
