import type { HttpClient } from '@/shared/lib/http';
import type { SettingsService } from '../domain/SettingsService';
import { DEFAULT_PRIVACY_SETTINGS, type PrivacySettings } from '../domain/models/PrivacySettings';

type ActorPrivacyResponse = {
  show_email?: boolean;
  show_birth_date?: boolean;
  show_city?: boolean;
  require_follow_approval?: boolean;
};

function toPrivacySettings(dto: ActorPrivacyResponse): PrivacySettings {
  return {
    showEmail: dto.show_email ?? DEFAULT_PRIVACY_SETTINGS.showEmail,
    showBirthDate: dto.show_birth_date ?? DEFAULT_PRIVACY_SETTINGS.showBirthDate,
    showCity: dto.show_city ?? DEFAULT_PRIVACY_SETTINGS.showCity,
    requireFollowApproval:
      dto.require_follow_approval ?? DEFAULT_PRIVACY_SETTINGS.requireFollowApproval,
  };
}

export function createSettingsService(client: HttpClient): SettingsService {
  return {
    async getPrivacySettings(): Promise<PrivacySettings> {
      const response = await client.request<ActorPrivacyResponse>('/actors/me');
      return toPrivacySettings(response);
    },

    async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<PrivacySettings> {
      const response = await client.request<ActorPrivacyResponse>('/actors/me', {
        method: 'PATCH',
        body: {
          ...(settings.showEmail !== undefined ? { show_email: settings.showEmail } : {}),
          ...(settings.showBirthDate !== undefined
            ? { show_birth_date: settings.showBirthDate }
            : {}),
          ...(settings.showCity !== undefined ? { show_city: settings.showCity } : {}),
          ...(settings.requireFollowApproval !== undefined
            ? { require_follow_approval: settings.requireFollowApproval }
            : {}),
        },
      });
      return toPrivacySettings(response);
    },
  };
}
