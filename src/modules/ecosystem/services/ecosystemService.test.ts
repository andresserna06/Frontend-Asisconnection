import { createHttpClient } from '@/shared/lib/http';

import { createEcosystemService } from './ecosystemService';

const BASE_URL = 'https://api.example.test/v1';
const fetchMock = jest.spyOn(globalThis, 'fetch');

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  fetchMock.mockReset();
});

afterAll(() => {
  fetchMock.mockRestore();
});

describe('createEcosystemService', () => {
  it('fetches active satellite links from GET /directory/links', async () => {
    const service = createEcosystemService(createHttpClient(BASE_URL));
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        data: [
          {
            id: 'link-1',
            project_name: 'SUMA 21',
            url: 'https://suma21.fundacionasisco.org',
            description: 'Plataforma de inclusión.',
          },
        ],
        meta: { page: 1, limit: 50, total: 1, total_pages: 1 },
      }),
    );

    await expect(service.listLinks()).resolves.toEqual([
      {
        id: 'link-1',
        projectName: 'SUMA 21',
        url: 'https://suma21.fundacionasisco.org',
        description: 'Plataforma de inclusión.',
      },
    ]);
    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE_URL}/directory/links?page=1&limit=50`);
  });
});
