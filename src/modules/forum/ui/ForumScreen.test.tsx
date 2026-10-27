import { fireEvent, render, screen } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  createAuthWrapper,
  createFakeRepository,
  createMemoryStorage,
} from '@/modules/auth/testUtils';
import { ForumRepositoryProvider } from '@/modules/forum/application/ForumRepositoryProvider';

import { ForumScreen } from './ForumScreen';

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 50, left: 0, right: 0, bottom: 30 },
};

const queryClients: QueryClient[] = [];

afterEach(() => {
  queryClients.forEach((queryClient) => queryClient.clear());
  queryClients.length = 0;
});

async function renderScreen() {
  const AuthWrapper = createAuthWrapper(createFakeRepository(), createMemoryStorage());
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  queryClients.push(queryClient);

  await render(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <QueryClientProvider client={queryClient}>
        <AuthWrapper>
          <ForumRepositoryProvider repository={null}>
            <ForumScreen />
          </ForumRepositoryProvider>
        </AuthWrapper>
      </QueryClientProvider>
    </SafeAreaProvider>,
  );
}

describe('ForumScreen', () => {
  it('shows the designed header, topic filters, and explicit unavailable state', async () => {
    await renderScreen();

    expect(screen.getByRole('header', { name: 'ASISCONNECTION' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Nueva publicación' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Notificaciones' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Filtrar por Todos' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Filtrar por Preguntas' })).toBeOnTheScreen();
    expect(screen.getByText('Estamos preparando el foro')).toBeOnTheScreen();
  });

  it('updates the selected topic accessibly', async () => {
    await renderScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Filtrar por Avisos' }));

    expect(screen.getByRole('button', { name: 'Filtrar por Avisos' })).toHaveProp(
      'accessibilityState',
      { selected: true },
    );
    expect(screen.getByRole('button', { name: 'Filtrar por Todos' })).toHaveProp(
      'accessibilityState',
      { selected: false },
    );
  });
});
