import { act, renderHook, waitFor } from '@testing-library/react-native';

import { AuthError } from '@/modules/auth/domain/models/AuthError';
import type { Session } from '@/modules/auth/domain/models/Session';
import {
  createAuthWrapper,
  createFakeAuthService,
  createMemoryStorage,
  TEST_TOKEN,
  TEST_USER,
} from '@/modules/auth/testUtils';

import { useLogin } from './useLogin';

async function renderLogin(service = createFakeAuthService()) {
  const rendered = await renderHook(() => useLogin(), {
    wrapper: createAuthWrapper(service, createMemoryStorage()),
  });
  return { ...rendered, service };
}

describe('useLogin', () => {
  it('does not call the backend when the form is invalid', async () => {
    const { result, service } = await renderLogin();
    await act(() =>
      result.current.submit({ email: '1053123456', password: '', acceptConsent: false }),
    );
    expect(result.current.formIssues).toEqual({
      email: 'emailNotEmail',
      password: 'passwordRequired',
      acceptConsent: 'consentRequired',
    });
    expect(service.login).not.toHaveBeenCalled();
  });

  it('trims the email before signing in', async () => {
    const { result, service } = await renderLogin();
    await act(() =>
      result.current.submit({ email: ' maria@prueba.com ', password: 'x', acceptConsent: true }),
    );
    expect(service.login).toHaveBeenCalledWith({
      email: 'maria@prueba.com',
      password: 'x',
      acceptConsent: true,
    });
  });

  it('exposes the error when sign in fails', async () => {
    const { result } = await renderLogin(
      createFakeAuthService({
        login: jest.fn(async () => {
          throw new AuthError('validation', { password: 'Muy corta' });
        }),
      }),
    );
    await act(() => result.current.submit({ email: 'a@b.co', password: 'x', acceptConsent: true }));
    expect(result.current.error?.kind).toBe('validation');
    expect(result.current.error?.fieldErrors.password).toBe('Muy corta');
    expect(result.current.isSubmitting).toBe(false);
  });

  it('ignores a second submit while the first is in progress', async () => {
    let finishLogin: (session: Session) => void = () => undefined;
    const service = createFakeAuthService({
      login: jest.fn(
        () =>
          new Promise<Session>((resolve) => {
            finishLogin = resolve;
          }),
      ),
    });
    const { result } = await renderLogin(service);
    const credentials = { email: 'a@b.co', password: 'x', acceptConsent: true };

    let firstSubmit: Promise<void> = Promise.resolve();
    await act(async () => {
      firstSubmit = result.current.submit(credentials);
      await result.current.submit(credentials);
    });
    expect(result.current.isSubmitting).toBe(true);
    expect(service.login).toHaveBeenCalledTimes(1);

    await act(async () => {
      finishLogin({ token: TEST_TOKEN, user: TEST_USER, isAnonymous: false });
      await firstSubmit;
    });
    await waitFor(() => expect(result.current.isSubmitting).toBe(false));
  });

  it('clears feedback for a field when it is edited', async () => {
    const { result } = await renderLogin();
    await act(() => result.current.submit({ email: '', password: '', acceptConsent: false }));
    await act(async () => result.current.clearFeedback('email'));
    expect(result.current.formIssues.email).toBeUndefined();
    expect(result.current.formIssues.password).toBe('passwordRequired');
  });
});
