import type { ReactNode } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';

import { useResponsiveLayout } from '@/shared/hooks/useResponsiveLayout';
import { COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SPACING } from '@/shared/theme';

type HeaderTealProps = {
  title: string;
  leftAccessory: ReactNode;
  rightAccessory: ReactNode;
  headerHeight: Animated.Value | number;
  paddingTop: number;
  titleStyle?: StyleProp<TextStyle>;
};

export function HeaderTeal({
  title,
  leftAccessory,
  rightAccessory,
  headerHeight,
  paddingTop,
  titleStyle,
}: HeaderTealProps) {
  const { isDesktop } = useResponsiveLayout();

  return (
    <Animated.View style={[styles.clip, isDesktop && styles.desktopClip, { height: headerHeight }]}>
      <View
        style={[
          styles.header,
          Platform.OS === 'web' ? styles.webHeader : { paddingTop },
          isDesktop && styles.desktopHeader,
        ]}
      >
        {leftAccessory}
        <Text accessibilityRole="header" numberOfLines={1} style={[styles.title, titleStyle]}>
          {title}
        </Text>
        {rightAccessory}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s10,
    paddingHorizontal: SPACING.s16,
    paddingBottom: SPACING.s14,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: RADIUS.cardLarge,
    borderBottomRightRadius: RADIUS.cardLarge,
  },
  desktopClip: {
    flexShrink: 0,
    marginTop: SPACING.s16,
    borderRadius: RADIUS.cardLarge,
  },
  // Browsers have no status bar inset, so the row is centered in the header height.
  webHeader: {
    flex: 1,
    paddingBottom: 0,
  },
  desktopHeader: {
    borderRadius: RADIUS.cardLarge,
  },
  title: {
    flex: 1,
    color: COLORS.onPrimary,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s21,
  },
});
