import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useResponsiveLayout } from '@/shared/hooks/useResponsiveLayout';
import { COLORS, CONTENT_MAX_WIDTH, DESKTOP_LAYOUT, SPACING } from '@/shared/theme';

type ResponsiveScreenProps = {
  children: ReactNode;
  // Side panel shown next to the column on wide desktop windows.
  aside?: ReactNode;
  desktopWidth?: number;
};

export function ResponsiveScreen({
  children,
  aside,
  desktopWidth = DESKTOP_LAYOUT.columnWidth,
}: ResponsiveScreenProps) {
  const { isDesktop, hasAside } = useResponsiveLayout();

  return (
    <View style={[styles.screen, isDesktop && styles.desktopScreen]}>
      <View
        style={[styles.content, isDesktop && [styles.desktopContent, { maxWidth: desktopWidth }]]}
      >
        {children}
      </View>
      {hasAside && aside !== undefined && (
        <ScrollView
          style={styles.aside}
          contentContainerStyle={styles.asideContent}
          showsVerticalScrollIndicator={false}
        >
          {aside}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  desktopScreen: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.s30,
    paddingHorizontal: SPACING.s24,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  desktopContent: {
    alignSelf: 'stretch',
  },
  aside: {
    flexGrow: 0,
    flexShrink: 0,
    width: DESKTOP_LAYOUT.asideWidth,
  },
  asideContent: {
    paddingVertical: SPACING.s16,
  },
});
