import { AuthError } from '@/modules/auth/domain/models/AuthError';

import { createHttpAuthRepository } from './httpAuthRepository';

const BASE_URL = 'https://api.example.test';
const fetchMock = jest.spyOn(globalThis, 'fetch');

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function expectAuthError(promise: Promise<unknown>, kind: AuthError['kind']) {
  await expect(promise).rejects.toBeInstanceOf(AuthError);
  await expect(promise).rejects.toMatchObject({ kind });
}

beforeEach(() => {
  fetchMock.mockReset();
});

afterAll(() => {
  fetchMock.mockRestore();
});

describe('createHttpAuthRepository', () => {
  const repository = createHttpAuthRepository(BASE_URL);

  it('logs in sending exactly email and clave', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { token: 'abc' }));

    await expect(
      repository.login({ email: 'maria@prueba.com', password: 'secreta' }),
    ).resolves.toBe('abc');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/auth/login`);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({ email: 'maria@prueba.com', clave: 'secreta' });
  });

  it('maps 401 on login to invalid credentials', async () => {
    fetchMock.mockResolvedValue(jsonResponse(401, { mensaje: 'No autorizado' }));
    await expectAuthError(
      repository.login({ email: 'a@b.co', password: 'x' }),
      'invalidCredentials',
    );
  });

  it('maps 400 to a validation error with field details', async () => {
    fetchMock.mockResolvedValue(jsonResponse(400, { errores: { email: 'Correo inválido' } }));
    const promise = repository.login({ email: 'a@b.co', password: 'x' });
    await expect(promise).rejects.toMatchObject({
      kind: 'validation',
      fieldErrors: { email: 'Correo inválido' },
    });
  });

  it('maps a failed request to a network error', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));
    await expectAuthError(repository.login({ email: 'a@b.co', password: 'x' }), 'network');
  });

  it('sends the bearer token and maps 401 on profile to an expired session', async () => {
    fetchMock.mockResolvedValue(jsonResponse(401, {}));
    await expectAuthError(repository.getProfile('tok'), 'sessionExpired');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/auth/perfil`);
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer tok' });
  });

  it('returns the profile sent by the backend', async () => {
    const user = { username: 'maria', email: 'maria@prueba.com', roles: ['ACUDIENTE'] };
    fetchMock.mockResolvedValue(jsonResponse(200, user));
    await expect(repository.getProfile('tok')).resolves.toEqual(user);
  });

  it('maps 403 to forbidden', async () => {
    fetchMock.mockResolvedValue(jsonResponse(403, {}));
    await expectAuthError(repository.getProfile('tok'), 'forbidden');
  });
});
