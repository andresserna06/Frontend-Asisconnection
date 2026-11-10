import { fireEvent, render, screen } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuth } from '@/modules/auth';
import { usePublicProfileService } from '@/modules/profile/usePublicProfileService';
import type { PublicProfileService } from '@/modules/profile/domain/PublicProfileService';
import type { PublicProfile } from '@/modules/profile/domain/models/PublicProfile';

import { OtherProfileScreen } from './OtherProfileScreen';

jest.mock('@/modules/profile/usePublicProfileService', () => ({
  usePublicProfileService: jest.fn(),
}));
jest.mock('@/modules/auth', () => ({
  ...jest.requireActual('@/modules/auth'),
  useAuth: jest.fn(),
}));
jest.mock('expo-router', () => ({
  router: { back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const TEST_PUBLIC_PROFILE: PublicProfile = {
  id: 'actor-1',
  fullName: 'Persona Pública',
  roles: ['ACUDIENTE'],
  photoUrl: null,
  shortBio: 'Descripción pública',
  birthDate: null,
  city: 'Manizales',
  postCount: 2,
  followerCount: 7,
  followingCount: 4,
};

async function renderScreen(profile = TEST_PUBLIC_PROFILE) {
  jest.mocked(useLocalSearchParams).mockReturnValue({ userId: 'actor-1' });
  jest.mocked(useAuth).mockReturnValue({
    status: 'signedIn',
    user: { username: 'persona', roles: ['ACUDIENTE'] },
    isAnonymous: false,
    signIn: async () => undefined,
    signInAnonymous: async () => undefined,
    registerAccount: async () => undefined,
    signOut: jest.fn(async () => undefined),
    authorizedClient: { request: jest.fn() },
  });
  jest.mocked(usePublicProfileService).mockReturnValue({
    getPublicProfile: jest.fn(async () => profile),
    getConnectionStatus: jest.fn(async () => 'notFollowing'),
    requestFollow: jest.fn(async () => 'pending'),
  } satisfies PublicProfileService);

  await render(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <OtherProfileScreen />
    </SafeAreaProvider>,
  );
}

describe('OtherProfileScreen', () => {
  beforeEach(() => {
    jest.mocked(router.back).mockClear();
  });

  it('shows public profile details without private fields and explains unavailable posts', async () => {
    await renderScreen();

    expect(await screen.findByRole('header', { name: 'Persona Pública' })).toBeOnTheScreen();
    expect(screen.getByText('Acudiente')).toBeOnTheScreen();
    expect(screen.getByText('Descripción pública')).toBeOnTheScreen();
    expect(screen.getByText('Manizales')).toBeOnTheScreen();
    expect(screen.getByText('Publicaciones (2)')).toBeOnTheScreen();
    expect(
      screen.getByText('Las publicaciones de otros perfiles aún no están disponibles.'),
    ).toBeOnTheScreen();
    expect(screen.queryByText('Correo')).toBeNull();
    expect(screen.queryByText('Fecha de nacimiento')).toBeNull();
  });

  it('returns to the previous screen from the header', async () => {
    await renderScreen();
    await screen.findByRole('header', { name: 'Persona Pública' });

    await fireEvent.press(screen.getByRole('button', { name: 'Volver al foro' }));

    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('requests to follow the profile and shows the pending state', async () => {
    const requestFollow = jest.fn(async () => 'pending' as const);
    jest.mocked(useLocalSearchParams).mockReturnValue({ userId: 'actor-1' });
    jest.mocked(useAuth).mockReturnValue({
      status: 'signedIn',
      user: { username: 'persona', roles: ['ACUDIENTE'] },
      isAnonymous: false,
      signIn: async () => undefined,
      signInAnonymous: async () => undefined,
      registerAccount: async () => undefined,
      signOut: jest.fn(async () => undefined),
      authorizedClient: { request: jest.fn() },
    });
    jest.mocked(usePublicProfileService).mockReturnValue({
      getPublicProfile: jest.fn(async () => TEST_PUBLIC_PROFILE),
      getConnectionStatus: jest.fn(async () => 'notFollowing'),
      requestFollow,
    } satisfies PublicProfileService);
    await render(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <OtherProfileScreen />
      </SafeAreaProvider>,
    );

    await screen.findByRole('header', { name: 'Persona Pública' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Seguir' }));

    expect(requestFollow).toHaveBeenCalledWith('actor-1');
    expect(await screen.findByRole('button', { name: 'Solicitud pendiente' })).toBeDisabled();
  });

  it('allows unfollowing when already following', async () => {
    const requestUnfollow = jest.fn(async () => 'notFollowing' as const);
    jest.mocked(useLocalSearchParams).mockReturnValue({ userId: 'actor-1' });
    jest.mocked(useAuth).mockReturnValue({
      status: 'signedIn',
      user: { username: 'persona', roles: ['ACUDIENTE'] },
      isAnonymous: false,
      signIn: async () => undefined,
      signInAnonymous: async () => undefined,
      registerAccount: async () => undefined,
      signOut: jest.fn(async () => undefined),
      authorizedClient: { request: jest.fn() },
    });
    jest.mocked(usePublicProfileService).mockReturnValue({
      getPublicProfile: jest.fn(async () => TEST_PUBLIC_PROFILE),
      getConnectionStatus: jest.fn(async () => 'following'),
      requestFollow: jest.fn(async () => 'following'),
      requestUnfollow,
    } satisfies PublicProfileService);
    await render(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <OtherProfileScreen />
      </SafeAreaProvider>,
    );

    const unfollowButton = await screen.findByRole('button', { name: 'Dejar de seguir' });
    expect(unfollowButton).not.toBeDisabled();
    await fireEvent.press(unfollowButton);

    expect(requestUnfollow).toHaveBeenCalledWith('actor-1');
    expect(await screen.findByRole('button', { name: 'Seguir' })).toBeOnTheScreen();
  });

  it('offers guest sign-in instead of requesting a follow', async () => {
    const signOut = jest.fn(async () => undefined);
    jest.mocked(useLocalSearchParams).mockReturnValue({ userId: 'actor-1' });
    jest.mocked(useAuth).mockReturnValue({
      status: 'signedIn',
      user: { username: 'Invitado', roles: ['BENEFICIARIO'] },
      isAnonymous: true,
      signIn: async () => undefined,
      signInAnonymous: async () => undefined,
      registerAccount: async () => undefined,
      signOut,
      authorizedClient: { request: jest.fn() },
    });
    const requestFollow = jest.fn(async () => 'pending' as const);
    jest.mocked(usePublicProfileService).mockReturnValue({
      getPublicProfile: jest.fn(async () => TEST_PUBLIC_PROFILE),
      getConnectionStatus: jest.fn(async () => 'notFollowing'),
      requestFollow,
    } satisfies PublicProfileService);
    await render(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <OtherProfileScreen />
      </SafeAreaProvider>,
    );

    await fireEvent.press(await screen.findByRole('button', { name: 'Inicia sesión para seguir' }));

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith('/login');
    expect(requestFollow).not.toHaveBeenCalled();
  });
});
