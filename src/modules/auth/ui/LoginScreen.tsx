import { StyleSheet, Text, View } from 'react-native';

import { STRINGS } from '@/shared/config/strings';

import { COLORS, FONT_FAMILY, FONT_SIZE } from '@/shared/theme';

// Placeholder screen: T-03 replaces it with the mockup login (01-Login).
export function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        {STRINGS.appName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  title: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s27,
    color: COLORS.textTitle,
  },
});
