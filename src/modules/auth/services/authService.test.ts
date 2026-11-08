import { AuthError } from '@/modules/auth/domain/models/AuthError';
import { createHttpClient } from '@/shared/lib/http';

import { createAuthService } from './authService';

const BASE_URL = 'https://api.example.test/v1';
const fetchMock = jest.spyOn(globalThis, 'fetch');
const CREDENTIALS = { email: 'maria@prueba.com', password: 'secreta', acceptConsent: true };

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

describe('createAuthService', () => {
  const service = createAuthService(createHttpClient(BASE_URL));

  it('logs in sending email, clave and consent, and returns the device session', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, {
        device_token: 'abc',
        synced_with_global_db: true,
        user: {
          id: 'u1',
          username: 'maria',
          email: 'maria@prueba.com',
          rol: 'ACUDIENTE',
          external_roles: ['ACUDIENTE', 'OTRO'],
          local_role: 'MODERATOR',
        },
      }),
    );

    await expect(service.login(CREDENTIALS)).resolves.toEqual({
      token: 'abc',
      user: { username: 'maria', roles: ['MODERATOR', 'ACUDIENTE'] },
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/auth/login`);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      email: 'maria@prueba.com',
      clave: 'secreta',
      accept_consent: true,
    });
  });

  it('maps 401 on login to invalid credentials', async () => {
    fetchMock.mockResolvedValue(jsonResponse(401, { status: 401, title: 'Unauthorized' }));
    await expectAuthError(service.login(CREDENTIALS), 'invalidCredentials');
  });

  it('maps a 400 problem details to field errors', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(400, {
        status: 400,
        errors: [
          { field: 'email', message: 'Correo inválido' },
          { field: 'accept_consent', message: 'Debe aceptar' },
        ],
      }),
    );
    await expect(service.login(CREDENTIALS)).rejects.toMatchObject({
      kind: 'validation',
      fieldErrors: { email: 'Correo inválido', acceptConsent: 'Debe aceptar' },
    });
  });

  it('maps a failed request or a 502 to a network error', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));
    await expectAuthError(service.login(CREDENTIALS), 'network');

    fetchMock.mockResolvedValueOnce(jsonResponse(502, { status: 502 }));
    await expectAuthError(service.login(CREDENTIALS), 'network');
  });

  it('loads the profile from /actors/me with the bearer token', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, { id: 'a1', username: 'maria', primary_role: 'VOLUNTARIO' }),
    );
    await expect(service.getProfile('tok')).resolves.toEqual({
      username: 'maria',
      roles: ['VOLUNTARIO'],
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/actors/me`);
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer tok' });
  });

  it('maps 401 on profile to an expired session', async () => {
    fetchMock.mockResolvedValue(jsonResponse(401, {}));
    await expectAuthError(service.getProfile('tok'), 'sessionExpired');
  });

  it('maps 403 to forbidden', async () => {
    fetchMock.mockResolvedValue(jsonResponse(403, {}));
    await expectAuthError(service.getProfile('tok'), 'forbidden');
  });

  it('registers a user via POST /auth/registro and returns the device session', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(201, {
        device_token: 'reg-tok',
        synced_with_global_db: true,
        user: {
          id: 'u2',
          username: 'carlos.voluntario',
          email: 'carlos@prueba.com',
          rol: 'VOLUNTARIO',
          external_roles: ['VOLUNTARIO'],
          local_role: null,
        },
      }),
    );

    await expect(
      service.register?.({
        username: 'carlos.voluntario',
        email: 'carlos@prueba.com',
        password: 'ClaveSegura123',
        role: 'VOLUNTARIO',
        acceptConsent: true,
      }),
    ).resolves.toEqual({
      token: 'reg-tok',
      user: { username: 'carlos.voluntario', roles: ['VOLUNTARIO'] },
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/auth/registro`);
    expect(init?.method).toBe('POST');
  });

  it('starts an anonymous guest session via POST /sessions/anonymous', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(201, {
        device_token: 'anon-tok',
        session_id: 'sess-anon-1',
      }),
    );

    await expect(
      service.loginAnonymous?.({
        acceptConsent: true,
        nickname: 'InvitadoFamiliar',
        roleTag: 'ACUDIENTE',
      }),
    ).resolves.toEqual({
      token: 'anon-tok',
      user: { username: 'InvitadoFamiliar', roles: ['ACUDIENTE'] },
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/sessions/anonymous`);
    expect(init?.method).toBe('POST');
  });
});
