import { createContext, useContext, type ReactNode } from 'react';

import type { ForumRepository } from '@/modules/forum/domain/ForumRepository';

const ForumRepositoryContext = createContext<ForumRepository | null>(null);

type ForumRepositoryProviderProps = {
  repository: ForumRepository | null;
  children: ReactNode;
};

export function ForumRepositoryProvider({ repository, children }: ForumRepositoryProviderProps) {
  return (
    <ForumRepositoryContext.Provider value={repository}>{children}</ForumRepositoryContext.Provider>
  );
}

export function useForumRepository(): ForumRepository | null {
  return useContext(ForumRepositoryContext);
}
