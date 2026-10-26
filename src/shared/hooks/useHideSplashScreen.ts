import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Keeps the native splash screen until everything needed for the first screen is ready.
export function useHideSplashScreen(isReady: boolean) {
  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);
}
