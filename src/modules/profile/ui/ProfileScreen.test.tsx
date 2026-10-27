import { fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { ProfileService } from '@/modules/profile/domain/ProfileService';
import { ProfileError } from '@/modules/profile/domain/models/ProfileError';
import { createFakeProfileService, TEST_PROFILE } from '@/modules/profile/testUtils';
import { useProfileService } from '@/modules/profile/useProfileService';

import { ProfileScreen } from './ProfileScreen';

// The screen gets its service from the composition root; tests swap it for a fake.
jest.mock('@/modules/profile/useProfileService', () => ({ useProfileService: jest.fn() }));

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

async function renderScreen(service: ProfileService = createFakeProfileService()) {
  jest.mocked(useProfileService).mockReturnValue(service);
  await render(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <ProfileScreen />
    </SafeAreaProvider>,
  );
  return service;
}

describe('ProfileScreen', () => {
  it('shows the profile, the private data and the own posts', async () => {
    await renderScreen();

    expect(await screen.findByText('Persona Prueba')).toBeOnTheScreen();
    expect(screen.getByText('Acudiente')).toBeOnTheScreen();
    expect(screen.getByLabelText('38 Seguidores')).toBeOnTheScreen();
    expect(screen.getByText('14 de mayo de 1988')).toBeOnTheScreen();
    expect(screen.getByText('Marzo de 2026')).toBeOnTheScreen();
    expect(await screen.findByText('Texto de una publicación propia.')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Publicaciones (1)' })).toBeSelected();
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

  it('shows the coming soon notice for actions not built yet', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await renderScreen();
    await screen.findByText('Persona Prueba');

    await fireEvent.press(screen.getByRole('button', { name: 'Editar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Cambiar foto de perfil' }));

    expect(alertSpy).toHaveBeenCalledTimes(2);
    alertSpy.mockRestore();
  });
});
