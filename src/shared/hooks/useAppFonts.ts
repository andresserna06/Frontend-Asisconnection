import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { FONT_ASSETS } from '@/shared/theme';

// Loads the app fonts and hides the splash screen when done.
// If loading fails the app still opens with the system font.
export function useAppFonts(): boolean {
  const [isLoaded, error] = useFonts(FONT_ASSETS);
  const isReady = isLoaded || error !== null;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  return isReady;
}
