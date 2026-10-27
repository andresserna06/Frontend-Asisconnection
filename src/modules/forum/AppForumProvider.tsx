import type { ReactNode } from 'react';

import { ForumRepositoryProvider } from './application/ForumRepositoryProvider';
import type { ForumRepository } from './domain/ForumRepository';
import { createDemoForumRepository } from './services/demoForumRepository';

// Punto único para inyectar el servicio cuando el backend esté disponible. Mientras
// tanto, en desarrollo se muestran publicaciones de prueba.
const repository: ForumRepository | null = __DEV__ ? createDemoForumRepository() : null;

type AppForumProviderProps = {
  children: ReactNode;
};

export function AppForumProvider({ children }: AppForumProviderProps) {
  return <ForumRepositoryProvider repository={repository}>{children}</ForumRepositoryProvider>;
}
