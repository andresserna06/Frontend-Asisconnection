import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RoleBadge, useAuth } from '@/modules/auth';
import { FORUM_STRINGS } from '@/modules/forum/ui/strings';
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from '@/shared/theme';
import { Button } from '@/shared/ui/atoms/Button';

// Placeholder until T-06 builds the forum. "Cerrar sesión" moves to Settings in T-12;
// it is here only so the login flow can be tested end to end.
export function ForumScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Text accessibilityRole="header" style={styles.title}>
        {FORUM_STRINGS.greeting(user?.username ?? '')}
      </Text>
      {user && <RoleBadge roles={user.roles} size="medium" />}
      <Text style={styles.body}>{FORUM_STRINGS.comingSoon}</Text>
      <Button label={FORUM_STRINGS.signOut} variant="outline" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: SPACING.s16,
    paddingHorizontal: SPACING.s20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.s22,
    color: COLORS.textTitle,
  },
  body: {
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s15,
    color: COLORS.textSecondary,
  },
});
