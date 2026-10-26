import { Alert } from 'react-native';

import { STRINGS } from '@/shared/config/strings';

// Single notice for features that are visible but not built yet (sign-up, password
// recovery, guest access). Remove each call when its feature exists.
export function showComingSoonNotice() {
  Alert.alert(STRINGS.comingSoonTitle, STRINGS.comingSoonMessage);
}
