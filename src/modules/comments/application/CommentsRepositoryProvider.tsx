import { createContext, useContext, type ReactNode } from 'react';

import type { CommentsRepository } from '@/modules/comments/domain/CommentsRepository';

const CommentsRepositoryContext = createContext<CommentsRepository | null>(null);

type CommentsRepositoryProviderProps = {
  repository: CommentsRepository | null;
  children: ReactNode;
};

export function CommentsRepositoryProvider({
  repository,
  children,
}: CommentsRepositoryProviderProps) {
  return (
    <CommentsRepositoryContext.Provider value={repository}>
      {children}
    </CommentsRepositoryContext.Provider>
  );
}

export function useCommentsRepository(): CommentsRepository | null {
  return useContext(CommentsRepositoryContext);
}
