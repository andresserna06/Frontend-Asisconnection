import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuth } from '@/modules/auth';
import type { AdminService } from '@/modules/admin/domain/AdminService';
import type { ModerationQueuePage } from '@/modules/admin/domain/models/ModerationItem';
import { AdminScreen } from '@/modules/admin/ui/AdminScreen';
import { useAdminService } from '@/modules/admin/useAdminService';
import { createHttpClient } from '@/shared/lib/http';

jest.mock('@/modules/auth', () => ({ useAuth: jest.fn() }));
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));
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

  it('lets admins find an account and assign it as moderator', async () => {
    const service = createService({
      searchAccounts: jest.fn(async () => [
        { id: 'account-id', username: 'persona', email: 'persona@prueba.com', role: 'ACUDIENTE' },
      ]),
    });
    configureScreen('ADMIN', service);
    await render(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <AdminScreen service={service} />
      </SafeAreaProvider>,
    );

    await fireEvent.press(await screen.findByRole('tab', { name: 'Moderadores' }));
    await fireEvent.changeText(screen.getByLabelText('Buscar por usuario o correo'), 'persona');
    await fireEvent.press(screen.getByRole('button', { name: 'Buscar cuentas' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Asignar persona' }));

    expect(service.searchAccounts).toHaveBeenCalledWith('persona');
    expect(service.assignModerator).toHaveBeenCalledWith('account-id');
    expect(screen.queryByText('Asignar moderador')).toBeNull();
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

  it('lets admins manage FAQs and Ecosystem links from dedicated tabs', async () => {
    const service = createService({
      listFaqs: jest.fn(async () => [
        {
          id: 'faq-1',
          category: 'Inscripciones',
          question: '¿Cómo inscribo a un beneficiario?',
          answer: 'En la sede principal.',
        },
      ]),
      createFaq: jest.fn(async (input) => ({ id: 'faq-2', ...input })),
      listEcosystemLinks: jest.fn(async () => [
        {
          id: 'suma21',
          projectName: 'SUMA 21',
          url: 'https://suma21-frontend.onrender.com',
          description: 'Donaciones y financiación',
        },
      ]),
      updateEcosystemLink: jest.fn(async (id, input) => ({ id, ...input })),
    });
    configureScreen('ADMIN', service);
    await render(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <AdminScreen service={service} />
      </SafeAreaProvider>,
    );

    await fireEvent.press(await screen.findByRole('tab', { name: 'FAQs' }));
    expect(await screen.findByText('¿Cómo inscribo a un beneficiario?')).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText('Categoría'), 'Programas');
    await fireEvent.changeText(screen.getByLabelText('Pregunta frecuente'), '¿Qué es SON UP?');
    await fireEvent.changeText(
      screen.getByLabelText('Respuesta oficial'),
      'Programa artístico y musical.',
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar pregunta' }));
    expect(service.createFaq).toHaveBeenCalledWith({
      category: 'Programas',
      question: '¿Qué es SON UP?',
      answer: 'Programa artístico y musical.',
    });

    await fireEvent.press(screen.getByRole('tab', { name: 'Ecosistema' }));
    expect(await screen.findByText('https://suma21-frontend.onrender.com')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Editar enlace SUMA 21' }));
    await fireEvent.changeText(
      screen.getByLabelText('URL de destino'),
      'https://suma21-nuevo.onrender.com',
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Actualizar enlace' }));
    expect(service.updateEcosystemLink).toHaveBeenCalledWith('suma21', {
      projectName: 'SUMA 21',
      url: 'https://suma21-nuevo.onrender.com',
      description: 'Donaciones y financiación',
    });
  });

  it('lets admins list, filter and activate or suspend system users from Usuarios tab', async () => {
    const service = createService({
      listUsers: jest.fn(async () => [
        {
          id: 'user-1',
          actorId: 'actor-1',
          username: 'camila.acudiente',
          email: 'camila@prueba.com',
          role: 'ACUDIENTE',
          localRole: null,
          displayName: 'Camila Pineda',
          isActive: false,
        },
      ]),
      updateUserStatus: jest.fn(async (id, isActive) => ({
        id,
        actorId: 'actor-1',
        username: 'camila.acudiente',
        email: 'camila@prueba.com',
        role: 'ACUDIENTE',
        localRole: null,
        displayName: 'Camila Pineda',
        isActive,
      })),
    });
    configureScreen('ADMIN', service);
    await render(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <AdminScreen service={service} />
      </SafeAreaProvider>,
    );

    await fireEvent.press(await screen.findByRole('tab', { name: 'Usuarios' }));
    expect(await screen.findByText('Camila Pineda')).toBeOnTheScreen();
    expect(screen.getByText('Suspendido')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Activar camila.acudiente' }));
    expect(service.updateUserStatus).toHaveBeenCalledWith('user-1', true);
    expect(await screen.findByText('Activo')).toBeOnTheScreen();
  });
});
