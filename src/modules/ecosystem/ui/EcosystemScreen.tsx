import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_FAMILY, FONT_SIZE } from '@/shared/theme';
import { ECOSYSTEM_STRINGS } from './strings';

export function EcosystemScreen() {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        {ECOSYSTEM_STRINGS.title}
      </Text>
      <Text style={styles.message}>{ECOSYSTEM_STRINGS.unavailable}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
    backgroundColor: COLORS.background,
  },
  title: {
    color: COLORS.textTitle,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s22,
  },
  message: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s16,
    textAlign: 'center',
  },
});
