import { fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthError } from '@/modules/auth/domain/models/AuthError';
import {
  createAuthWrapper,
  createFakeAuthService,
  createMemoryStorage,
} from '@/modules/auth/testUtils';

import { LoginScreen } from './LoginScreen';

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

async function renderScreen(service = createFakeAuthService()) {
  const AuthWrapper = createAuthWrapper(service, createMemoryStorage());
  await render(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <AuthWrapper>
        <LoginScreen />
      </AuthWrapper>
    </SafeAreaProvider>,
  );
  return service;
}

async function fillAndSubmit(email: string, password: string) {
  await fireEvent.changeText(screen.getByLabelText('Correo o documento'), email);
  await fireEvent.changeText(screen.getByLabelText('Contraseña'), password);
  await fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));
}

describe('LoginScreen', () => {
  it('toggles the password visibility', async () => {
    await renderScreen();
    expect(screen.getByLabelText('Contraseña')).toHaveProp('secureTextEntry', true);

    await fireEvent.press(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(screen.getByLabelText('Contraseña')).toHaveProp('secureTextEntry', false);
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toBeOnTheScreen();
  });

  it('shows field messages and does not submit an invalid form', async () => {
    const service = await renderScreen();
    await fillAndSubmit('1053123456', '');

    expect(screen.getByText('Por ahora ingresa con tu correo.')).toBeOnTheScreen();
    expect(screen.getByText('Ingresa tu contraseña.')).toBeOnTheScreen();
    expect(service.login).not.toHaveBeenCalled();
  });

  it('disables the button while signing in', async () => {
    await renderScreen(
      createFakeAuthService({ login: jest.fn(() => new Promise<string>(() => {})) }),
    );
    await fillAndSubmit('maria@prueba.com', 'secreta');

    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeDisabled();
    expect(screen.getByText(/puede tardar/)).toBeOnTheScreen();
  });

  it('shows a clear message for wrong credentials', async () => {
    await renderScreen(
      createFakeAuthService({
        login: jest.fn(async () => {
          throw new AuthError('invalidCredentials');
        }),
      }),
    );
    await fillAndSubmit('maria@prueba.com', 'mala');

    expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeOnTheScreen();
  });

  it('shows the coming-soon notice for features not built yet', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await renderScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Crear cuenta' }));
    await fireEvent.press(screen.getByRole('button', { name: '¿Olvidaste tu contraseña?' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Ingresar como invitado' }));

    expect(alertSpy).toHaveBeenCalledTimes(3);
    alertSpy.mockRestore();
  });
});
