import { useCallback, useEffect, useRef, useState } from 'react';

import type { SettingsService } from '../domain/SettingsService';
import { DEFAULT_PRIVACY_SETTINGS, type PrivacySettings } from '../domain/models/PrivacySettings';

export function usePrivacySettings(
  initial: PrivacySettings = DEFAULT_PRIVACY_SETTINGS,
  service?: SettingsService,
) {
  const [settings, setSettings] = useState<PrivacySettings>(initial);
  const [isSaving, setIsSaving] = useState(false);
  const settingsRef = useRef<PrivacySettings>(initial);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    if (!service || hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    let isMounted = true;
    service
      .getPrivacySettings()
      .then((loaded) => {
        if (isMounted) {
          settingsRef.current = loaded;
          setSettings(loaded);
        }
      })
      .catch(() => undefined);
    return () => {
      isMounted = false;
    };
  }, [service]);

  const toggleSetting = useCallback(
    (field: keyof PrivacySettings) => {
      const previousValue = settingsRef.current[field];
      const nextValue = !previousValue;
      const nextSettings = { ...settingsRef.current, [field]: nextValue };
      settingsRef.current = nextSettings;
      setSettings(nextSettings);

      if (service) {
        setIsSaving(true);
        void service
          .updatePrivacySettings({ [field]: nextValue })
          .catch(() => {
            // Roll back to previous value if persistence fails (Ley 1581 integrity)
            setSettings((current) => {
              const reverted = { ...current, [field]: previousValue };
              settingsRef.current = reverted;
              return reverted;
            });
          })
          .finally(() => {
            setIsSaving(false);
          });
      }
    },
    [service],
  );

  return {
    settings,
    toggleSetting,
    isSaving,
  };
}
