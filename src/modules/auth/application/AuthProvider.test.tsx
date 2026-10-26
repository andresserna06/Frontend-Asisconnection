import { act, renderHook, waitFor } from '@testing-library/react-native';

import { AuthError } from '@/modules/auth/domain/models/AuthError';
import {
  createAuthWrapper,
  createFakeRepository,
  createMemoryStorage,
  TEST_TOKEN,
  TEST_USER,
} from '@/modules/auth/testUtils';

import { useAuth } from './AuthProvider';

async function renderAuth(repository = createFakeRepository(), storage = createMemoryStorage()) {
  const rendered = await renderHook(() => useAuth(), {
    wrapper: createAuthWrapper(repository, storage),
  });
  await waitFor(() => expect(rendered.result.current.status).not.toBe('loading'));
  return { ...rendered, repository, storage };
}

describe('session restore', () => {
  it('starts signed out when there is no saved token', async () => {
    const { result } = await renderAuth();
    expect(result.current.status).toBe('signedOut');
    expect(result.current.user).toBeNull();
  });

  it('signs in with a saved, valid token', async () => {
    const { result, repository } = await renderAuth(
      createFakeRepository(),
      createMemoryStorage(TEST_TOKEN),
    );
    expect(result.current.status).toBe('signedIn');
    expect(result.current.user).toEqual(TEST_USER);
    expect(repository.getProfile).toHaveBeenCalledWith(TEST_TOKEN);
  });

  it('clears an expired token and signs out', async () => {
    const repository = createFakeRepository({
      getProfile: jest.fn(async () => {
        throw new AuthError('sessionExpired');
      }),
    });
    const { result, storage } = await renderAuth(repository, createMemoryStorage(TEST_TOKEN));
    expect(result.current.status).toBe('signedOut');
    expect(storage.peek()).toBeNull();
  });

  it('keeps the token when the profile cannot be loaded offline', async () => {
    const repository = createFakeRepository({
      getProfile: jest.fn(async () => {
        throw new AuthError('network');
      }),
    });
    const { result, storage } = await renderAuth(repository, createMemoryStorage(TEST_TOKEN));
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
    const repository = createFakeRepository({
      login: jest.fn(async () => {
        throw new AuthError('invalidCredentials');
      }),
    });
    const { result, storage } = await renderAuth(repository);
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
    const repository = createFakeRepository({
      logout: jest.fn(async () => {
        throw new AuthError('network');
      }),
    });
    const { result, storage } = await renderAuth(repository, createMemoryStorage(TEST_TOKEN));
    expect(result.current.status).toBe('signedIn');

    await act(() => result.current.signOut());
    expect(repository.logout).toHaveBeenCalledWith(TEST_TOKEN);
    expect(result.current.status).toBe('signedOut');
    expect(storage.peek()).toBeNull();
  });
});
