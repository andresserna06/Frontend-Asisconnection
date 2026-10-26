import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { useAppFonts } from '@/shared/hooks/useAppFonts';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const isReady = useAppFonts();

  if (!isReady) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
