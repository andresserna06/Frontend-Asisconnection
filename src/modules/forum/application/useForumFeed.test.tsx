import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import type { ForumRepository } from '@/modules/forum/domain/ForumRepository';

import { ForumRepositoryProvider } from './ForumRepositoryProvider';
import { useForumFeed } from './useForumFeed';

const queryClients: QueryClient[] = [];

afterEach(() => {
  queryClients.forEach((queryClient) => queryClient.clear());
  queryClients.length = 0;
});

function createWrapper(repository: ForumRepository) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  queryClients.push(queryClient);

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ForumRepositoryProvider repository={repository}>{children}</ForumRepositoryProvider>
      </QueryClientProvider>
    );
  };
}

describe('useForumFeed', () => {
  it('passes the selected filter to the forum service', async () => {
    const repository: ForumRepository = {
      listPosts: jest.fn(async () => []),
    };
    const Wrapper = createWrapper(repository);
    const { result } = await renderHook(() => useForumFeed('questions'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.status).toBe('success'));

    expect(repository.listPosts).toHaveBeenCalledWith({ filter: 'questions' });
  });
});
