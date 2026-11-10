import { useCallback, useRef, useState } from 'react';
import { Animated, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { useResponsiveLayout } from '@/shared/hooks/useResponsiveLayout';

const SCROLL_THRESHOLD = 6;
const ANIMATION_DURATION = 250;

export function useCollapsingHeader(expandedHeight: number) {
  const { isDesktop } = useResponsiveLayout();
  const [headerHeight] = useState(() => new Animated.Value(expandedHeight));
  const previousScrollOffset = useRef(0);
  const isHeaderVisible = useRef(true);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentOffset = Math.max(0, event.nativeEvent.contentOffset.y);
      const scrollDifference = currentOffset - previousScrollOffset.current;

      if (scrollDifference > SCROLL_THRESHOLD && isHeaderVisible.current) {
        isHeaderVisible.current = false;
        Animated.timing(headerHeight, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: false,
        }).start();
      } else if (scrollDifference < -SCROLL_THRESHOLD && !isHeaderVisible.current) {
        isHeaderVisible.current = true;
        Animated.timing(headerHeight, {
          toValue: expandedHeight,
          duration: ANIMATION_DURATION,
          useNativeDriver: false,
        }).start();
      }

      previousScrollOffset.current = currentOffset;
    },
    [expandedHeight, headerHeight],
  );

  // On desktop the header stays fixed, even if it was collapsed before widening the window.
  return { headerHeight: isDesktop ? expandedHeight : headerHeight, onScroll };
}
