import { renderHook, waitFor } from '@testing-library/react-native';

import type { PublicProfileService } from '@/modules/profile/domain/PublicProfileService';
import { TEST_POST } from '@/modules/profile/testUtils';

import { useActorPost } from './useActorPost';

function createService(): PublicProfileService {
  return {
    getPublicProfile: jest.fn(),
    getConnectionStatus: jest.fn(),
    requestFollow: jest.fn(),
    getActorPosts: jest.fn(async () => [TEST_POST]),
  };
}

describe('useActorPost', () => {
  it('finds the post in the list of its author', async () => {
    const service = createService();

    const { result } = await renderHook(() => useActorPost(service, 'actor-1', TEST_POST.id));

    await waitFor(() => expect(result.current).toMatchObject({ data: TEST_POST }));
    expect(service.getActorPosts).toHaveBeenCalledWith('actor-1');
  });

  it('resolves to null when the author has no such post', async () => {
    const service = createService();

    const { result } = await renderHook(() => useActorPost(service, 'actor-1', 'missing'));

    await waitFor(() => expect(result.current).toMatchObject({ status: 'success', data: null }));
  });
});
