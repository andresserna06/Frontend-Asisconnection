import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { createFakeNotificationsService } from '../testUtils';
import { useNotificationsService } from '../useNotificationsService';
import { NotificationsScreen } from './NotificationsScreen';

jest.mock('../useNotificationsService', () => ({
  useNotificationsService: jest.fn(),
}));

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 50, left: 0, right: 0, bottom: 30 },
};

describe('NotificationsScreen', () => {
  beforeEach(() => {
    jest.mocked(useNotificationsService).mockReturnValue(createFakeNotificationsService());
  });

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

  it('marks notifications as read when pressing the mark-read button', async () => {
    const markAllRead = jest.fn().mockResolvedValue(undefined);
    const service = createFakeNotificationsService({ markAllRead }, [
      {
        id: 'notif-1',
        type: 'COMMENT_ON_POST',
        title: 'Nuevo comentario en tu publicación',
        body: 'Carlos Voluntario comentó en tu publicación.',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ]);
    jest.mocked(useNotificationsService).mockReturnValue(service);

    await render(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <NotificationsScreen />
      </SafeAreaProvider>,
    );

    expect(await screen.findByText('Nuevo comentario en tu publicación')).toBeOnTheScreen();
    const button = screen.getByRole('button', { name: 'Marcar todo como leído' });
    await fireEvent.press(button);

    await waitFor(() => {
      expect(markAllRead).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText('Leídas')).toBeOnTheScreen();
  });
});
