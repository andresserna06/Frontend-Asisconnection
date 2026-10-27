import { ProfileError } from '@/modules/profile/domain/models/ProfileError';
import { TEST_POST, TEST_PROFILE } from '@/modules/profile/testUtils';
import { createHttpClient } from '@/shared/lib/http';

import { createProfileService } from './profileService';

const BASE_URL = 'https://api.example.test';
const fetchMock = jest.spyOn(globalThis, 'fetch');

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status });
}

beforeEach(() => {
  fetchMock.mockReset();
});

afterAll(() => {
  fetchMock.mockRestore();
});

describe('createProfileService', () => {
  const service = createProfileService(createHttpClient(BASE_URL));

  it('gets the own profile', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, TEST_PROFILE));
    await expect(service.getMyProfile()).resolves.toEqual(TEST_PROFILE);
    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE_URL}/usuarios/me`);
  });

  it('gets the own and the saved posts', async () => {
    fetchMock.mockImplementation(async () => jsonResponse(200, [TEST_POST]));

    await expect(service.getMyPosts()).resolves.toEqual([TEST_POST]);
    await expect(service.getMySavedPosts()).resolves.toEqual([TEST_POST]);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      `${BASE_URL}/usuarios/me/publicaciones`,
      `${BASE_URL}/usuarios/me/guardados`,
    ]);
  });

  it('maps a request without response to a network error', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));
    const promise = service.getMyProfile();
    await expect(promise).rejects.toBeInstanceOf(ProfileError);
    await expect(promise).rejects.toMatchObject({ kind: 'network' });
  });

  it('maps any other failure to an unknown error', async () => {
    fetchMock.mockResolvedValue(jsonResponse(500, {}));
    await expect(service.getMyPosts()).rejects.toMatchObject({ kind: 'unknown' });
  });
});
