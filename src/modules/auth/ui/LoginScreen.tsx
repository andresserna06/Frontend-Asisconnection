import { StyleSheet, Text, View } from 'react-native';

import { STRINGS } from '@/shared/config/strings';

// Placeholder screen: T-03 replaces it with the mockup login (01-Login).
export function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header">{STRINGS.appName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
