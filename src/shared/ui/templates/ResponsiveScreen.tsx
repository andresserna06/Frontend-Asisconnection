import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { COLORS, CONTENT_MAX_WIDTH } from '@/shared/theme';

type ResponsiveScreenProps = {
  children: ReactNode;
};

export function ResponsiveScreen({ children }: ResponsiveScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    overflow: 'hidden',
  },
});
