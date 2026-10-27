import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { AuthProvider } from '@/modules/auth/application/AuthProvider';
import type { AuthRepository } from '@/modules/auth/domain/AuthRepository';
import { createFakeRepository, createMemoryStorage, TEST_TOKEN } from '@/modules/auth/testUtils';
import { ForumError } from '@/modules/forum/domain/models/ForumError';
import type { ForumRepository } from '@/modules/forum/domain/ForumRepository';

import { ForumRepositoryProvider } from './ForumRepositoryProvider';
import { useForumFeed } from './useForumFeed';

const queryClients: QueryClient[] = [];

afterEach(() => {
  queryClients.forEach((queryClient) => queryClient.clear());
  queryClients.length = 0;
});

function createWrapper(repository: ForumRepository, authRepository: AuthRepository) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  queryClients.push(queryClient);
  const storage = createMemoryStorage(TEST_TOKEN);

  return {
    storage,
    Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          <AuthProvider repository={authRepository} storage={storage}>
            <ForumRepositoryProvider repository={repository}>{children}</ForumRepositoryProvider>
          </AuthProvider>
        </QueryClientProvider>
      );
    },
  };
}

describe('useForumFeed', () => {
  it('passes the session token and selected filter to the repository', async () => {
    const repository: ForumRepository = {
      listPosts: jest.fn(async () => []),
    };
    const { Wrapper } = createWrapper(repository, createFakeRepository());
    const { result } = await renderHook(() => useForumFeed('questions'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.status).toBe('success'));

    expect(repository.listPosts).toHaveBeenCalledWith({
      token: TEST_TOKEN,
      filter: 'questions',
    });
  });

  it('clears the session when the repository reports an expired token', async () => {
    const repository: ForumRepository = {
      listPosts: jest.fn(async () => {
        throw new ForumError('sessionExpired');
      }),
    };
    const authRepository = createFakeRepository();
    const { Wrapper, storage } = createWrapper(repository, authRepository);
    const { result } = await renderHook(() => useForumFeed('all'), { wrapper: Wrapper });

    await waitFor(() => expect(storage.peek()).toBeNull());

    expect(authRepository.logout).toHaveBeenCalledWith(TEST_TOKEN);
    expect(result.current.status).toBe('error');
  });
});
