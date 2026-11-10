import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useAuth } from '@/modules/auth';
import type { ProfileService } from '@/modules/profile/domain/ProfileService';
import { ProfileError } from '@/modules/profile/domain/models/ProfileError';
import type { MyProfile } from '@/modules/profile/domain/models/MyProfile';
import { createFakeProfileService, TEST_PROFILE } from '@/modules/profile/testUtils';
import { useProfileService } from '@/modules/profile/useProfileService';
import { createHttpClient } from '@/shared/lib/http';

import { ProfileScreen } from './ProfileScreen';

// The screen gets its service from the composition root; tests swap it for a fake.
jest.mock('@/modules/profile/useProfileService', () => ({ useProfileService: jest.fn() }));
jest.mock('@/modules/auth', () => ({
  ...jest.requireActual('@/modules/auth'),
  useAuth: jest.fn(),
}));
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

async function renderScreen(service: ProfileService = createFakeProfileService()) {
  jest.mocked(useProfileService).mockReturnValue(service);
  jest.mocked(useAuth).mockReturnValue(createAuthValue(false));
  await render(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <ProfileScreen />
    </SafeAreaProvider>,
  );
  return service;
}

function createAuthValue(isAnonymous: boolean): ReturnType<typeof useAuth> {
  return {
    status: 'signedIn',
    user: { username: 'Invitado', roles: ['BENEFICIARIO'] },
    isAnonymous,
    signIn: async () => undefined,
    signInAnonymous: async () => undefined,
    registerAccount: async () => undefined,
    signOut: mockSignOut,
    authorizedClient: createHttpClient('https://api.example.test'),
  };
}

const mockSignOut = jest.fn(async () => undefined);

describe('ProfileScreen', () => {
  beforeEach(() => {
    mockSignOut.mockClear();
    jest.mocked(router.replace).mockClear();
  });

  it('shows the profile, the private data and the own posts', async () => {
    await renderScreen();

    expect(await screen.findByText('Persona Prueba')).toBeOnTheScreen();
    expect(screen.getByText('Acudiente')).toBeOnTheScreen();
    expect(screen.getByLabelText('38 Seguidores')).toBeOnTheScreen();
    expect(screen.getByText('14 de mayo de 1988')).toBeOnTheScreen();
    expect(screen.getByText('Marzo de 2026')).toBeOnTheScreen();
    expect(await screen.findByText('Texto de una publicación propia.')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Publicaciones (1)' })).toBeSelected();
    expect(screen.queryByRole('button', { name: 'Iniciar sesión' })).toBeNull();
  });

  it('shows the saved posts with their author', async () => {
    await renderScreen();
    await screen.findByText('Texto de una publicación propia.');

    await fireEvent.press(screen.getByRole('tab', { name: 'Guardados (1)' }));

    expect(await screen.findByText('Texto de una publicación guardada.')).toBeOnTheScreen();
    expect(screen.getByText('Otra Persona')).toBeOnTheScreen();
    expect(screen.queryByText('Texto de una publicación propia.')).toBeNull();
  });

  it('marks missing data instead of leaving it blank', async () => {
    await renderScreen(
      createFakeProfileService({
        getMyProfile: jest.fn(async () => ({ ...TEST_PROFILE, birthDate: null, city: null })),
        getMyPosts: jest.fn(async () => []),
      }),
    );

    expect(await screen.findAllByText('Sin agregar')).toHaveLength(2);
    expect(await screen.findByText('Aún no has publicado nada.')).toBeOnTheScreen();
  });

  it('shows the error and retries', async () => {
    const getMyProfile = jest
      .fn()
      .mockRejectedValueOnce(new ProfileError('network'))
      .mockResolvedValueOnce(TEST_PROFILE);
    await renderScreen(createFakeProfileService({ getMyProfile }));

    expect(
      await screen.findByText('No hay conexión. Revisa tu internet e inténtalo de nuevo.'),
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('Persona Prueba')).toBeOnTheScreen();
    expect(getMyProfile).toHaveBeenCalledTimes(2);
  });

  it('opens an own post and the list of followers', async () => {
    await renderScreen();

    await fireEvent.press(
      await screen.findByRole('button', {
        name: 'Abrir publicación: Texto de una publicación propia.',
      }),
    );
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/users/[userId]/posts/[postId]',
      params: { userId: 'user-1', postId: 'post-1' },
    });

    await fireEvent.press(screen.getByRole('button', { name: '38 Seguidores' }));
    expect(router.push).toHaveBeenCalledWith('/profile/followers');
  });

  it('opens edit profile modal when pressing Editar', async () => {
    await renderScreen();
    await screen.findByText('Persona Prueba');

    await fireEvent.press(screen.getByRole('button', { name: 'Editar' }));

    expect(screen.getByText('Editar perfil')).toBeOnTheScreen();
  });

  it('shows the administration entry only for administrator profiles', async () => {
    await renderScreen(
      createFakeProfileService({
        getMyProfile: jest.fn(async (): Promise<MyProfile> => ({
          ...TEST_PROFILE,
          roles: ['ADMIN'],
        })),
      }),
    );

    expect(
      await screen.findByRole('button', { name: 'Abrir panel de administración' }),
    ).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).toBeNull();
  });

  async function renderGuestScreen() {
    jest.mocked(useProfileService).mockReturnValue(createFakeProfileService());
    jest.mocked(useAuth).mockReturnValue(createAuthValue(true));
    await render(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <ProfileScreen />
      </SafeAreaProvider>,
    );
  }

  it('lets a guest go to login from their profile', async () => {
    await renderGuestScreen();

    expect(screen.queryByText('Persona Prueba')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(router.replace).toHaveBeenCalledWith('/login');
    });
  });

  it('lets a guest end the session from their profile', async () => {
    await renderGuestScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Cerrar sesión' }));

    await waitFor(() => expect(mockSignOut).toHaveBeenCalledTimes(1));
  });
});
