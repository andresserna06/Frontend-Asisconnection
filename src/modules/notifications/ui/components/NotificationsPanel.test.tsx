import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { useAuth } from '@/modules/auth';
import type { NotificationItem } from '@/modules/notifications/domain/models/NotificationItem';
import { useNotificationsService } from '@/modules/notifications/useNotificationsService';
import { createHttpClient } from '@/shared/lib/http';

import { NotificationsPanel } from './NotificationsPanel';

jest.mock('@/modules/auth', () => ({ useAuth: jest.fn() }));
jest.mock('@/modules/notifications/useNotificationsService', () => ({
  useNotificationsService: jest.fn(),
}));
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useFocusEffect: jest.fn(),
}));

function notifications(count: number): NotificationItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `notification-${index}`,
    type: 'COMMENT_ON_POST',
    title: `Aviso ${index}`,
    body: 'Comentaron tu publicación.',
    isRead: index > 0,
    createdAt: new Date().toISOString(),
  }));
}

async function renderPanel(items: NotificationItem[], isAnonymous = false) {
  const listNotifications = jest.fn(async () => items);
  jest.mocked(useAuth).mockReturnValue({
    status: 'signedIn',
    user: { username: 'persona', roles: ['ACUDIENTE'] },
    isAnonymous,
    signIn: async () => undefined,
    signInAnonymous: async () => undefined,
    registerAccount: async () => undefined,
    signOut: async () => undefined,
    authorizedClient: createHttpClient('https://api.example.test'),
  });
  jest.mocked(useNotificationsService).mockReturnValue({
    listNotifications,
    markAllRead: jest.fn(async () => undefined),
  });
  await render(<NotificationsPanel />);
  return listNotifications;
}

describe('NotificationsPanel', () => {
  it('shows only the latest notifications and opens the full list', async () => {
    await renderPanel(notifications(7));

    expect(await screen.findByText('Aviso 4')).toBeOnTheScreen();
    expect(screen.queryByText('Aviso 5')).toBeNull();
    expect(
      screen.getByLabelText('Sin leer. Aviso 0. Comentaron tu publicación.'),
    ).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Ver todas' }));

    expect(router.push).toHaveBeenCalledWith('/notifications');
  });

  it('explains when there is nothing recent', async () => {
    await renderPanel([]);

    expect(await screen.findByText('No tienes notificaciones recientes.')).toBeOnTheScreen();
  });

  it('does not query the service for guests', async () => {
    const listNotifications = await renderPanel([], true);

    expect(
      screen.getByText('Inicia sesión con una cuenta para consultar tus notificaciones.'),
    ).toBeOnTheScreen();
    expect(listNotifications).not.toHaveBeenCalled();
  });
});
