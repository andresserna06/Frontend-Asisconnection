import type { ReactNode } from 'react';

import { ForumRepositoryProvider } from './application/ForumRepositoryProvider';
import type { ForumRepository } from './domain/ForumRepository';

// Punto único para inyectar el servicio cuando el backend esté disponible.
const repository: ForumRepository | null = null;

type AppForumProviderProps = {
  children: ReactNode;
};

export function AppForumProvider({ children }: AppForumProviderProps) {
  return <ForumRepositoryProvider repository={repository}>{children}</ForumRepositoryProvider>;
}
