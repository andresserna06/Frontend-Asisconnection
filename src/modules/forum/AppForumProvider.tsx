import { useMemo, type ReactNode } from 'react';

import { useAuthorizedHttpClient } from '@/modules/auth';

import { ForumRepositoryProvider } from './application/ForumRepositoryProvider';
import { createForumService } from './services/forumService';

type AppForumProviderProps = {
  children: ReactNode;
};

export function AppForumProvider({ children }: AppForumProviderProps) {
  const client = useAuthorizedHttpClient();
  const repository = useMemo(() => createForumService(client), [client]);

  return <ForumRepositoryProvider repository={repository}>{children}</ForumRepositoryProvider>;
}
