import { useFonts } from 'expo-font';

import { FONT_ASSETS } from '@/shared/theme';

// True once the app fonts are loaded. If loading fails the app still opens with the
// system font.
export function useAppFonts(): boolean {
  const [isLoaded, error] = useFonts(FONT_ASSETS);
  return isLoaded || error !== null;
}
