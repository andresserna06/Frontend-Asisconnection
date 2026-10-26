import { Stack } from 'expo-router';

// Plain stack until T-04 replaces it with the bottom tab bar.
export default function TabsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
