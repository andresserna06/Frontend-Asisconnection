import { Platform, useWindowDimensions } from 'react-native';

import { DESKTOP_MIN_WIDTH, DESKTOP_WIDE_MIN_WIDTH } from '@/shared/theme';

// The desktop layout exists only in the browser, so the native apps never enter it.
export function useResponsiveLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= DESKTOP_MIN_WIDTH;

  return { isDesktop, hasAside: isDesktop && width >= DESKTOP_WIDE_MIN_WIDTH };
}
