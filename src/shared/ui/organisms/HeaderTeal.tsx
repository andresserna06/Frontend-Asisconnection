import type { ReactNode } from 'react';
import { Animated, StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';

import { COLORS, FONT_FAMILY, FONT_SIZE, RADIUS, SPACING } from '@/shared/theme';

type HeaderTealProps = {
  title: string;
  leftAccessory: ReactNode;
  rightAccessory: ReactNode;
  headerHeight: Animated.Value;
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
  return (
    <Animated.View style={[styles.clip, { height: headerHeight }]}>
      <View style={[styles.header, { paddingTop }]}>
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
  title: {
    flex: 1,
    color: COLORS.onPrimary,
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s21,
  },
});
