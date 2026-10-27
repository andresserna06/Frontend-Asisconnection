import { useMemo, type ReactNode } from 'react';

import { useAuth } from '@/modules/auth';

import { CommentsRepositoryProvider } from './application/CommentsRepositoryProvider';
import type { CommentsRepository } from './domain/CommentsRepository';
import { createDemoCommentsRepository } from './services/demoCommentsRepository';

type AppCommentsProviderProps = {
  children: ReactNode;
};

// Single place to inject the service once the backend is available. Until then,
// development builds show test comments.
export function AppCommentsProvider({ children }: AppCommentsProviderProps) {
  const { user } = useAuth();
  const username = user?.username ?? '';
  const repository = useMemo<CommentsRepository | null>(
    () => (__DEV__ ? createDemoCommentsRepository(username) : null),
    [username],
  );

  return (
    <CommentsRepositoryProvider repository={repository}>{children}</CommentsRepositoryProvider>
  );
}
