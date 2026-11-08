import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { PostsService } from '@/modules/posts/domain/PostsService';
import { createFakePostsService, TEST_SUBMISSION_RESULT } from '@/modules/posts/testUtils';
import { usePostsService } from '@/modules/posts/usePostsService';

import { router } from 'expo-router';

import { NewPostScreen } from './NewPostScreen';

jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
}));

jest.mock('@/modules/auth', () => ({
  getPrimaryRole: () => ({ label: 'Acudiente' }),
  useAuth: () => ({
    user: { username: 'test.user', roles: ['ACUDIENTE'] },
  }),
}));

jest.mock('@/modules/posts/usePostsService', () => ({
  usePostsService: jest.fn(),
}));

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 50, left: 0, right: 0, bottom: 30 },
};

async function renderScreen(service: PostsService = createFakePostsService()) {
  jest.mocked(usePostsService).mockReturnValue(service);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  await render(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <QueryClientProvider client={queryClient}>
        <NewPostScreen />
      </QueryClientProvider>
    </SafeAreaProvider>,
  );

  return service;
}

describe('NewPostScreen', () => {
  it('renders the composer and lets the user choose a topic', async () => {
    await renderScreen();

    expect(screen.getByRole('header', { name: 'Nueva publicación' })).toBeOnTheScreen();
    expect(screen.getByLabelText('Escribe tu publicación')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('radio', { name: 'Voluntariado' }));

    expect(screen.getByRole('radio', { name: 'Voluntariado' })).toHaveProp('accessibilityState', {
      checked: true,
    });
  });

  it('requires text and topic before calling the service', async () => {
    const service = await renderScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Publicar' }));
    expect(screen.getByText('Escribe un mensaje antes de publicar.')).toBeOnTheScreen();
    expect(service.createPost).not.toHaveBeenCalled();

    await fireEvent.changeText(
      screen.getByLabelText('Escribe tu publicación'),
      'Una idea para la comunidad',
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Publicar' }));
    expect(screen.getByText('Elige un tema para tu publicación.')).toBeOnTheScreen();
    expect(service.createPost).not.toHaveBeenCalled();
  });

  it('submits the post to the backend and shows the moderation notice', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const service = await renderScreen();

    await fireEvent.changeText(
      screen.getByLabelText('Escribe tu publicación'),
      '  Una idea para la comunidad  ',
    );
    await fireEvent.press(screen.getByRole('radio', { name: 'Apoyo Pedagógico' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Publicar' }));

    await waitFor(() =>
      expect(service.createPost).toHaveBeenCalledWith({
        category: 'guides',
        content: 'Una idea para la comunidad',
      }),
    );
    expect(alertSpy).toHaveBeenCalledWith('Publicación enviada', TEST_SUBMISSION_RESULT.message);
    expect(router.back).toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
