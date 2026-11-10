import { fireEvent, render, screen } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { ForumRepository } from '@/modules/forum/domain/ForumRepository';
import { ForumRepositoryProvider } from '@/modules/forum/application/ForumRepositoryProvider';
import type { ForumPost } from '@/modules/forum/domain/models/ForumPost';

import { ForumScreen } from './ForumScreen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 50, left: 0, right: 0, bottom: 30 },
};

const queryClients: QueryClient[] = [];

afterEach(() => {
  queryClients.forEach((queryClient) => queryClient.clear());
  queryClients.length = 0;
});

const TEST_POST: ForumPost = {
  id: 'post-1',
  category: 'guides',
  author: {
    id: 'actor-1',
    profileId: 'actor-1',
    name: 'Persona Autora',
    initials: 'PA',
    roleLabel: 'Acudiente',
    avatarUri: null,
  },
  publishedAtLabel: 'Ahora',
  content: 'Publicación de prueba',
  media: null,
  likeCount: 0,
  commentCount: 0,
};

async function renderScreen(repository: ForumRepository | null = null) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  queryClients.push(queryClient);

  await render(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <QueryClientProvider client={queryClient}>
        <ForumRepositoryProvider repository={repository}>
          <ForumScreen />
        </ForumRepositoryProvider>
      </QueryClientProvider>
    </SafeAreaProvider>,
  );
}

describe('ForumScreen', () => {
  beforeEach(() => {
    jest.mocked(router.push).mockClear();
  });

  it('shows the designed header, topic filters, and explicit unavailable state', async () => {
    await renderScreen();

    expect(screen.getByRole('header', { name: 'ASISCONNECTION' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Nueva publicación' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Notificaciones' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Filtrar por Todos' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Filtrar por Salud' })).toBeOnTheScreen();
    expect(screen.getByText('Estamos preparando el foro')).toBeOnTheScreen();
  });

  it('updates the selected topic accessibly', async () => {
    await renderScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Filtrar por Noticias' }));

    expect(screen.getByRole('button', { name: 'Filtrar por Noticias' })).toHaveProp(
      'accessibilityState',
      { selected: true },
    );
    expect(screen.getByRole('button', { name: 'Filtrar por Todos' })).toHaveProp(
      'accessibilityState',
      { selected: false },
    );
  });

  it('opens the registered author profile when their name is pressed', async () => {
    const repository: ForumRepository = {
      listPosts: jest.fn(async () => [TEST_POST]),
    };
    await renderScreen(repository);

    const authorButtons = await screen.findAllByRole('button', {
      name: 'Ver perfil de Persona Autora',
    });
    const authorNameButton = authorButtons.at(-1);
    expect(authorNameButton).toBeDefined();
    if (authorNameButton) {
      await fireEvent.press(authorNameButton);
    }

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/users/[userId]',
      params: { userId: 'actor-1' },
    });
  });

  it('does not make an author without an actor ID appear navigable', async () => {
    const repository: ForumRepository = {
      listPosts: jest.fn(async () => [
        {
          ...TEST_POST,
          author: { ...TEST_POST.author, profileId: null },
        },
      ]),
    };
    await renderScreen(repository);

    expect(await screen.findByText('Persona Autora')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Ver perfil de Persona Autora' })).toBeNull();
  });
});
