import type { PrivacySettings } from './models/PrivacySettings';

export type SettingsService = {
  getPrivacySettings(): Promise<PrivacySettings>;
  updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<PrivacySettings>;
};
