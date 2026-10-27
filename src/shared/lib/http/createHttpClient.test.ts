import { createHttpClient } from './createHttpClient';
import { HttpError } from './HttpError';

const BASE_URL = 'https://api.example.test';
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

describe('createHttpClient', () => {
  const client = createHttpClient(BASE_URL);

  it('sends a GET to the base URL and returns the JSON body', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));

    await expect(client.request('/items')).resolves.toEqual({ ok: true });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/items`);
    expect(init?.method).toBe('GET');
    expect(init?.body).toBeUndefined();
    expect(init?.headers).not.toHaveProperty('Authorization');
  });

  it('sends a JSON body and the bearer token', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, {}));

    await client.request('/items', { method: 'POST', body: { name: 'a' }, token: 'tok' });

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(String(init?.body))).toEqual({ name: 'a' });
    expect(init?.headers).toMatchObject({
      'Content-Type': 'application/json',
      Authorization: 'Bearer tok',
    });
  });

  it('returns null when the response has no body', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(client.request('/items', { method: 'DELETE' })).resolves.toBeNull();
  });

  it('rejects with the status and body of an error response', async () => {
    fetchMock.mockResolvedValue(jsonResponse(400, { errores: { email: 'x' } }));

    const promise = client.request('/items');
    await expect(promise).rejects.toBeInstanceOf(HttpError);
    await expect(promise).rejects.toMatchObject({ status: 400, body: { errores: { email: 'x' } } });
  });

  it('rejects with a null status when there is no response', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));
    await expect(client.request('/items')).rejects.toMatchObject({ status: null });
  });
});
