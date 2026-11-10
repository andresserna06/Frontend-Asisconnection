import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SettingsScreen } from './SettingsScreen';

const mockSignOut = jest.fn().mockResolvedValue(undefined);
const mockHttpClient = {
  request: jest.fn().mockResolvedValue({
    show_email: false,
    show_birth_date: false,
    show_city: false,
    require_follow_approval: false,
  }),
};

jest.mock('@/modules/auth', () => ({
  useAuth: () => ({
    signOut: mockSignOut,
  }),
  useAuthorizedHttpClient: () => mockHttpClient,
}));

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 50, left: 0, right: 0, bottom: 30 },
};

describe('SettingsScreen', () => {
  beforeEach(() => {
    mockSignOut.mockClear();
  });

  it('starts with all personal data switches off by default (Ley 1581) and updates preview on toggle', async () => {
    await render(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <SettingsScreen />
      </SafeAreaProvider>,
    );

    expect(
      screen.getByText('Solo se muestra tu nombre, rol y publicaciones aprobadas.'),
    ).toBeOnTheScreen();

    const emailSwitch = screen.getByRole('switch', { name: 'Correo electrónico' });
    await fireEvent.press(emailSwitch);

    expect(screen.getByText('Visible en la comunidad: Correo electrónico')).toBeOnTheScreen();
  });

  it('signs out when pressing Cerrar sesión', async () => {
    await render(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <SettingsScreen />
      </SafeAreaProvider>,
    );

    const signOutBtn = screen.getByRole('button', { name: 'Cerrar sesión' });
    await fireEvent.press(signOutBtn);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
