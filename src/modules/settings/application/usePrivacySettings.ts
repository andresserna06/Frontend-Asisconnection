import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_PRIVACY_SETTINGS, type PrivacySettings } from '../domain/models/PrivacySettings';
import type { SettingsService } from '../domain/SettingsService';

export function usePrivacySettings(
  service?: SettingsService,
  initial: PrivacySettings = DEFAULT_PRIVACY_SETTINGS,
) {
  const [settings, setSettings] = useState<PrivacySettings>(initial);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isActive = true;
    if (service) {
      service
        .getPrivacySettings()
        .then((remote) => {
          if (isActive) {
            setSettings(remote);
          }
        })
        .catch(() => undefined);
    }
    return () => {
      isActive = false;
    };
  }, [service]);

  const toggleSetting = useCallback(
    async (field: keyof PrivacySettings) => {
      const nextValue = !settings[field];
      setSettings((prev) => ({
        ...prev,
        [field]: nextValue,
      }));

      if (service) {
        setIsSaving(true);
        try {
          await service.updatePrivacySettings({ [field]: nextValue });
        } catch {
          // Revert optimistic update on failure
          setSettings((prev) => ({
            ...prev,
            [field]: !nextValue,
          }));
        } finally {
          setIsSaving(false);
        }
      }
    },
    [service, settings],
  );

  return {
    settings,
    toggleSetting,
    isSaving,
  };
}
