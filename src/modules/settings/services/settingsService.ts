import type { PrivacySettings } from '../domain/models/PrivacySettings';
import type { SettingsService } from '../domain/SettingsService';
import type { HttpClient } from '@/shared/lib/http';

type ActorProfileResponse = {
  show_email?: boolean;
  show_birth_date?: boolean;
  show_city?: boolean;
  require_follow_approval?: boolean;
};

export function createSettingsService(client: HttpClient): SettingsService {
  function toPrivacySettings(actor: ActorProfileResponse): PrivacySettings {
    return {
      showEmail: actor.show_email ?? false,
      showBirthDate: actor.show_birth_date ?? false,
      showCity: actor.show_city ?? false,
      requireFollowApproval: actor.require_follow_approval ?? false,
    };
  }

  return {
    async getPrivacySettings() {
      const actor = await client.request<ActorProfileResponse>('/actors/me');
      return toPrivacySettings(actor);
    },

    async updatePrivacySettings(settings) {
      const actor = await client.request<ActorProfileResponse>('/actors/me', {
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
      return toPrivacySettings(actor);
    },
  };
}
