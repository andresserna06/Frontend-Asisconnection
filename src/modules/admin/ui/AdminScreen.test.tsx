import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuth } from '@/modules/auth';
import type { AdminService } from '@/modules/admin/domain/AdminService';
import type { ModerationQueuePage } from '@/modules/admin/domain/models/ModerationItem';
import { AdminScreen } from '@/modules/admin/ui/AdminScreen';
import { useAdminService } from '@/modules/admin/useAdminService';
import { createHttpClient } from '@/shared/lib/http';

jest.mock('@/modules/auth', () => ({ useAuth: jest.fn() }));
jest.mock('@/modules/admin/useAdminService', () => ({ useAdminService: jest.fn() }));

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const queuePage: ModerationQueuePage = {
  items: [
    {
      id: 'pending-post',
      itemType: 'POST',
      content: 'Publicación pendiente de revisión',
      imageUrl: null,
      author: {
        displayName: 'Persona prueba',
        roleLabel: 'ACUDIENTE',
        isRegistered: true,
      },
      createdAt: '2026-11-09T12:00:00.000Z',
    },
  ],
  page: 1,
  totalItems: 1,
  totalPages: 1,
  hasNextPage: false,
};

function createService(overrides: Partial<AdminService> = {}): AdminService {
  return {
    listPending: jest.fn(async () => queuePage),
    updateModerationStatus: jest.fn(async () => undefined),
    listModerators: jest.fn(async () => []),
    assignModerator: jest.fn(async () => undefined),
    revokeModerator: jest.fn(async () => undefined),
    ...overrides,
  };
}

function configureScreen(role: 'ADMIN' | 'ACUDIENTE', service: AdminService) {
  jest.mocked(useAuth).mockReturnValue({
    status: 'signedIn',
    user: { username: 'test.user', roles: [role] },
    isAnonymous: false,
    signIn: jest.fn(async () => undefined),
    signOut: jest.fn(async () => undefined),
    authorizedClient: createHttpClient('https://api.example.test'),
  });
  jest.mocked(useAdminService).mockReturnValue(service);
}

describe('AdminScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the moderation queue and submits an approval', async () => {
    const service = createService();
    configureScreen('ADMIN', service);
    await render(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <AdminScreen service={service} />
      </SafeAreaProvider>,
    );

    expect(await screen.findByText('Publicación pendiente de revisión')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Aprobar' }));

    expect(service.updateModerationStatus).toHaveBeenCalledWith('pending-post', 'POST', 'APPROVED');
  });

  it('lets admins assign moderators using an account ID', async () => {
    const service = createService();
    configureScreen('ADMIN', service);
    await render(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <AdminScreen service={service} />
      </SafeAreaProvider>,
    );

    await fireEvent.press(await screen.findByRole('tab', { name: 'Moderadores' }));
    await fireEvent.changeText(screen.getByLabelText('ID de cuenta'), 'account-id');
    await fireEvent.press(screen.getByRole('button', { name: 'Asignar moderador' }));

    expect(service.assignModerator).toHaveBeenCalledWith('account-id');
  });

  it('does not request admin data for non-admin users', async () => {
    const service = createService();
    configureScreen('ACUDIENTE', service);
    await render(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <AdminScreen service={service} />
      </SafeAreaProvider>,
    );

    expect(
      await screen.findByText('Esta sección está disponible solo para administradores.'),
    ).toBeOnTheScreen();
    expect(service.listPending).not.toHaveBeenCalled();
    expect(service.listModerators).not.toHaveBeenCalled();
  });
});
