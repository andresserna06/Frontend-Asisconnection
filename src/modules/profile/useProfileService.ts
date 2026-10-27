import { useMemo } from 'react';

import { useAuthorizedHttpClient } from '@/modules/auth';
import type { ProfileService } from '@/modules/profile/domain/ProfileService';

import { createProfileService } from './services/profileService';

// Composition root of the module: the only place that wires services into the screen.
export function useProfileService(): ProfileService {
  const client = useAuthorizedHttpClient();
  return useMemo(() => createProfileService(client), [client]);
}
