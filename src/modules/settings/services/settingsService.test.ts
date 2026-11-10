import { createSettingsService } from './settingsService';
import type { HttpClient } from '@/shared/lib/http';

describe('settingsService', () => {
  it('loads privacy settings from GET /actors/me', async () => {
    const mockClient: HttpClient = {
      request: jest.fn().mockResolvedValue({
        show_email: true,
        show_birth_date: false,
        show_city: true,
        require_follow_approval: true,
      }),
    };

    const service = createSettingsService(mockClient);
    const settings = await service.getPrivacySettings();

    expect(mockClient.request).toHaveBeenCalledWith('/actors/me');
    expect(settings).toEqual({
      showEmail: true,
      showBirthDate: false,
      showCity: true,
      requireFollowApproval: true,
    });
  });

  it('updates privacy settings through PATCH /actors/me', async () => {
    const mockClient: HttpClient = {
      request: jest.fn().mockResolvedValue({
        show_email: false,
        show_birth_date: true,
        show_city: false,
        require_follow_approval: false,
      }),
    };

    const service = createSettingsService(mockClient);
    const updated = await service.updatePrivacySettings({
      showBirthDate: true,
    });

    expect(mockClient.request).toHaveBeenCalledWith('/actors/me', {
      method: 'PATCH',
      body: {
        show_birth_date: true,
      },
    });
    expect(updated.showBirthDate).toBe(true);
  });
});
