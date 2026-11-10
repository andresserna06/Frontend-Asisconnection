import { fireEvent, render, screen } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useTogglePostLike } from '@/modules/forum';
import type { PublicProfileService } from '@/modules/profile/domain/PublicProfileService';
import { TEST_POST } from '@/modules/profile/testUtils';
import { usePublicProfileService } from '@/modules/profile/usePublicProfileService';

import { ActorPostScreen } from './ActorPostScreen';

jest.mock('@/modules/removal', () => ({
  RemoveContentButton: () => null,
  useContentRemoval: () => ({ isHidden: () => false }),
}));
jest.mock('@/modules/forum', () => ({ useTogglePostLike: jest.fn() }));
jest.mock('@/modules/profile/usePublicProfileService', () => ({
  usePublicProfileService: jest.fn(),
}));
jest.mock('expo-router', () => ({
  router: { back: jest.fn(), canGoBack: jest.fn(() => true), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const LONG_TEXT = 'Una publicación larga. '.repeat(20).trim();

async function renderScreen(postId: string, toggleLike = jest.fn(async () => true)) {
  jest.mocked(useLocalSearchParams).mockReturnValue({ userId: 'actor-1', postId });
  jest.mocked(useTogglePostLike).mockReturnValue(toggleLike);
  jest.mocked(usePublicProfileService).mockReturnValue({
    getPublicProfile: jest.fn(),
    getConnectionStatus: jest.fn(),
    requestFollow: jest.fn(),
    getActorPosts: jest.fn(async () => [{ ...TEST_POST, text: LONG_TEXT }]),
  } satisfies PublicProfileService);

  await render(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <ActorPostScreen />
    </SafeAreaProvider>,
  );
}

describe('ActorPostScreen', () => {
  it('shows the whole post and opens its comments', async () => {
    await renderScreen(TEST_POST.id);

    expect(await screen.findByText(LONG_TEXT)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: '23 comentarios' }));

    expect(router.push).toHaveBeenCalledWith(`/comments/${TEST_POST.id}`);
  });

  it('likes the post', async () => {
    const toggleLike = jest.fn(async () => true);
    await renderScreen(TEST_POST.id, toggleLike);

    await fireEvent.press(await screen.findByRole('button', { name: '61 me gusta' }));

    expect(toggleLike).toHaveBeenCalledWith(TEST_POST.id);
  });

  it('explains when the post does not exist', async () => {
    await renderScreen('missing');

    expect(await screen.findByText('No encontramos esta publicación.')).toBeOnTheScreen();
  });
});
