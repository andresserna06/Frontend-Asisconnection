import { createHttpClient } from '@/shared/lib/http';

import { createSettingsService } from './settingsService';

const BASE_URL = 'https://api.example.test/v1';
const fetchMock = jest.spyOn(globalThis, 'fetch');

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('createSettingsService', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  afterAll(() => {
    fetchMock.mockRestore();
  });

  it('loads privacy settings from GET /actors/me and defaults missing flags to false (Ley 1581)', async () => {
    const service = createSettingsService(createHttpClient(BASE_URL));
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        show_email: false,
        show_birth_date: false,
        show_city: true,
        require_follow_approval: false,
      }),
    );

    await expect(service.getPrivacySettings()).resolves.toEqual({
      showEmail: false,
      showBirthDate: false,
      showCity: true,
      requireFollowApproval: false,
    });
    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE_URL}/actors/me`);
  });

  it('updates privacy settings via PATCH /actors/me and maps snake_case response', async () => {
    const service = createSettingsService(createHttpClient(BASE_URL));
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        show_email: true,
        show_birth_date: false,
        show_city: true,
        require_follow_approval: true,
      }),
    );

    const updated = await service.updatePrivacySettings({
      showEmail: true,
      requireFollowApproval: true,
    });

    expect(updated).toEqual({
      showEmail: true,
      showBirthDate: false,
      showCity: true,
      requireFollowApproval: true,
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/actors/me`);
    expect(init?.method).toBe('PATCH');
    expect(JSON.parse(String(init?.body))).toEqual({
      show_email: true,
      require_follow_approval: true,
    });
  });
});
