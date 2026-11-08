import { useMemo, type ReactNode } from 'react';

import { useAuthorizedHttpClient } from '@/modules/auth';

import { CommentsRepositoryProvider } from './application/CommentsRepositoryProvider';
import { createCommentsService } from './services/commentsService';

type AppCommentsProviderProps = {
  children: ReactNode;
};

export function AppCommentsProvider({ children }: AppCommentsProviderProps) {
  const client = useAuthorizedHttpClient();
  const repository = useMemo(() => createCommentsService(client), [client]);

  return (
    <CommentsRepositoryProvider repository={repository}>{children}</CommentsRepositoryProvider>
  );
}
