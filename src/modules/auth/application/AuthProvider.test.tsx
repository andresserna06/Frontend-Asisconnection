import { act, renderHook, waitFor } from '@testing-library/react-native';

import { AuthError } from '@/modules/auth/domain/models/AuthError';
import {
  createAuthWrapper,
  createFakeAuthService,
  createMemoryStorage,
  TEST_BASE_URL,
  TEST_TOKEN,
  TEST_USER,
} from '@/modules/auth/testUtils';
import { HttpError } from '@/shared/lib/http';

import { useAuth } from './AuthProvider';

async function renderAuth(service = createFakeAuthService(), storage = createMemoryStorage()) {
  const rendered = await renderHook(() => useAuth(), {
    wrapper: createAuthWrapper(service, storage),
  });
  await waitFor(() => expect(rendered.result.current.status).not.toBe('loading'));
  return { ...rendered, service, storage };
}

describe('session restore', () => {
  it('starts signed out when there is no saved token', async () => {
    const { result } = await renderAuth();
    expect(result.current.status).toBe('signedOut');
    expect(result.current.user).toBeNull();
  });

  it('signs in with a saved, valid token', async () => {
    const { result, service } = await renderAuth(
      createFakeAuthService(),
      createMemoryStorage(TEST_TOKEN),
    );
    expect(result.current.status).toBe('signedIn');
    expect(result.current.user).toEqual(TEST_USER);
    expect(service.getProfile).toHaveBeenCalledWith(TEST_TOKEN);
  });

  it('clears an expired token and signs out', async () => {
    const service = createFakeAuthService({
      getProfile: jest.fn(async () => {
        throw new AuthError('sessionExpired');
      }),
    });
    const { result, storage } = await renderAuth(service, createMemoryStorage(TEST_TOKEN));
    expect(result.current.status).toBe('signedOut');
    expect(storage.peek()).toBeNull();
  });

  it('keeps the token when the profile cannot be loaded offline', async () => {
    const service = createFakeAuthService({
      getProfile: jest.fn(async () => {
        throw new AuthError('network');
      }),
    });
    const { result, storage } = await renderAuth(service, createMemoryStorage(TEST_TOKEN));
    expect(result.current.status).toBe('signedOut');
    expect(storage.peek()).toBe(TEST_TOKEN);
  });
});

describe('signIn', () => {
  it('saves the token and exposes the user', async () => {
    const { result, storage } = await renderAuth();
    await act(() => result.current.signIn({ email: 'test@prueba.com', password: 'x' }));
    expect(result.current.status).toBe('signedIn');
    expect(result.current.user).toEqual(TEST_USER);
    expect(storage.peek()).toBe(TEST_TOKEN);
  });

  it('rejects with invalid credentials and stays signed out', async () => {
    const service = createFakeAuthService({
      login: jest.fn(async () => {
        throw new AuthError('invalidCredentials');
      }),
    });
    const { result, storage } = await renderAuth(service);
    await act(() =>
      expect(result.current.signIn({ email: 'a@b.co', password: 'x' })).rejects.toMatchObject({
        kind: 'invalidCredentials',
      }),
    );
    expect(result.current.status).toBe('signedOut');
    expect(storage.saveToken).not.toHaveBeenCalled();
  });
});

describe('signOut', () => {
  it('clears the session even if the backend call fails', async () => {
    const service = createFakeAuthService({
      logout: jest.fn(async () => {
        throw new AuthError('network');
      }),
    });
    const { result, storage } = await renderAuth(service, createMemoryStorage(TEST_TOKEN));
    expect(result.current.status).toBe('signedIn');

    await act(() => result.current.signOut());
    expect(service.logout).toHaveBeenCalledWith(TEST_TOKEN);
    expect(result.current.status).toBe('signedOut');
    expect(storage.peek()).toBeNull();
  });
});

describe('authorizedClient', () => {
  const fetchMock = jest.spyOn(globalThis, 'fetch');

  afterEach(() => {
    fetchMock.mockReset();
  });

  afterAll(() => {
    fetchMock.mockRestore();
  });

  it('sends the session token', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));
    const { result } = await renderAuth(createFakeAuthService(), createMemoryStorage(TEST_TOKEN));

    await expect(result.current.authorizedClient.request('/posts')).resolves.toEqual([]);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${TEST_BASE_URL}/posts`);
    expect(init?.headers).toMatchObject({ Authorization: `Bearer ${TEST_TOKEN}` });
  });

  it('signs out on a 401 and still rejects', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    const { result, storage } = await renderAuth(
      createFakeAuthService(),
      createMemoryStorage(TEST_TOKEN),
    );

    await act(() =>
      expect(result.current.authorizedClient.request('/posts')).rejects.toBeInstanceOf(HttpError),
    );
    expect(result.current.status).toBe('signedOut');
    expect(storage.peek()).toBeNull();
  });

  it('keeps the session on other errors', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));
    const { result } = await renderAuth(createFakeAuthService(), createMemoryStorage(TEST_TOKEN));

    await act(() =>
      expect(result.current.authorizedClient.request('/posts')).rejects.toMatchObject({
        status: 500,
      }),
    );
    expect(result.current.status).toBe('signedIn');
  });
});
