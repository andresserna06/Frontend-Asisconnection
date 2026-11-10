import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import type { ForumRepository } from '@/modules/forum/domain/ForumRepository';

import { useModerationQueue } from './useModerationQueue';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useModerationQueue', () => {
  it('loads pending moderation items and invalidates queries after deciding', async () => {
    const listPendingModeration = jest.fn().mockResolvedValue([
      {
        id: 'pending-1',
        itemType: 'POST' as const,
        content: 'Publicación en revisión',
        authorDisplayName: 'Lucía',
        createdAt: '2026-11-08T12:00:00.000Z',
      },
    ]);
    const moderateItem = jest.fn().mockResolvedValue(undefined);
    const repository: ForumRepository = {
      listPosts: jest.fn().mockResolvedValue([]),
      listPendingModeration,
      moderateItem,
    };

    const { result } = await renderHook(() => useModerationQueue(repository, true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].content).toBe('Publicación en revisión');

    await act(async () => {
      await result.current.decide('pending-1', 'POST', 'APPROVED');
    });

    expect(moderateItem).toHaveBeenCalledWith('pending-1', 'POST', 'APPROVED');
  });

  it('does not fetch pending moderation items when isEnabled is false', async () => {
    const listPendingModeration = jest.fn();
    const repository: ForumRepository = {
      listPosts: jest.fn().mockResolvedValue([]),
      listPendingModeration,
    };

    const { result } = await renderHook(() => useModerationQueue(repository, false), {
      wrapper: createWrapper(),
    });

    expect(result.current.items).toEqual([]);
    expect(listPendingModeration).not.toHaveBeenCalled();
  });
});
