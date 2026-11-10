import { useMemo } from 'react';

import { useAuthorizedHttpClient } from '@/modules/auth';
import type { SettingsService } from './domain/SettingsService';
import { createSettingsService } from './services/settingsService';

// Composition root of the module: the only place that wires services into the screen.
export function useSettingsService(): SettingsService {
  const client = useAuthorizedHttpClient();
  return useMemo(() => createSettingsService(client), [client]);
}
