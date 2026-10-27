import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PROFILE_STRINGS } from '@/modules/profile/ui/strings';
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from '@/shared/theme';
import { TextButton } from '@/shared/ui/atoms/TextButton';

type StatusMessageProps =
  | { kind: 'loading' }
  | { kind: 'message'; message: string }
  | { kind: 'error'; message: string; onRetry: () => void };

// Loading, empty and error states of the profile.
export function StatusMessage(props: StatusMessageProps) {
  if (props.kind === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text accessibilityRole={props.kind === 'error' ? 'alert' : 'text'} style={styles.message}>
        {props.message}
      </Text>
      {props.kind === 'error' && (
        <TextButton label={PROFILE_STRINGS.retry} onPress={props.onRetry} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: SPACING.s8,
    paddingVertical: SPACING.s24,
    paddingHorizontal: SPACING.s20,
  },
  message: {
    textAlign: 'center',
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.s14,
    color: COLORS.textSecondary,
  },
});
