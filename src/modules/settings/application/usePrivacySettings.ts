import { useCallback, useState } from 'react';

import { DEFAULT_PRIVACY_SETTINGS, type PrivacySettings } from '../domain/models/PrivacySettings';

export function usePrivacySettings(initial: PrivacySettings = DEFAULT_PRIVACY_SETTINGS) {
  const [settings, setSettings] = useState<PrivacySettings>(initial);

  const toggleSetting = useCallback((field: keyof PrivacySettings) => {
    setSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  }, []);

  return {
    settings,
    toggleSetting,
  };
}
