import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { COLORS } from '@/shared/theme';

type DesktopShellProps = {
  sidebar: ReactNode;
  children: ReactNode;
};

// The tree keeps the same shape with or without sidebar, so resizing the window
// never remounts the navigator and the navigation history survives.
export function DesktopShell({ sidebar, children }: DesktopShellProps) {
  return (
    <View style={styles.shell}>
      {sidebar}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
});
