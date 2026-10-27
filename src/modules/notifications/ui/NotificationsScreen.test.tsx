import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NotificationsScreen } from './NotificationsScreen';

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 50, left: 0, right: 0, bottom: 30 },
};

describe('NotificationsScreen', () => {
  it('shows the date groups without invented notifications', async () => {
    await render(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <NotificationsScreen />
      </SafeAreaProvider>,
    );

    expect(screen.getByRole('header', { name: 'Notificaciones' })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Hoy' })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Ayer' })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Últimos 7 días' })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Últimos 30 días' })).toBeOnTheScreen();
    expect(screen.getAllByText('No hay notificaciones en este periodo.')).toHaveLength(4);
  });

  it('keeps the mark-read control available for the future service integration', async () => {
    await render(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <NotificationsScreen />
      </SafeAreaProvider>,
    );

    expect(screen.getByRole('button', { name: 'Marcar todo como leído' })).toBeOnTheScreen();
    expect(screen.getByText('Marcar leídas')).toBeOnTheScreen();
  });
});
