import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  ForumRepository,
  ModerationPendingItem,
} from '@/modules/forum/domain/ForumRepository';

// Application hook for ADMIN / MODERATOR moderation queue (RN-02).
export function useModerationQueue(repository: ForumRepository, isEnabled = true) {
  const queryClient = useQueryClient();

  const query = useQuery<ModerationPendingItem[]>({
    queryKey: ['forum', 'moderation', 'pending'],
    enabled: isEnabled,
    queryFn: async () => {
      if (!repository.listPendingModeration) {
        return [];
      }
      return repository.listPendingModeration();
    },
  });

  const decide = useCallback(
    async (id: string, itemType: 'POST' | 'COMMENT', status: 'APPROVED' | 'REJECTED') => {
      if (!repository.moderateItem) return;
      await repository.moderateItem(id, itemType, status);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['forum', 'moderation', 'pending'] }),
        queryClient.invalidateQueries({ queryKey: ['forum', 'posts'] }),
      ]);
    },
    [repository, queryClient],
  );

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ? 'No se pudo cargar la cola de moderación.' : null,
    reload: query.refetch,
    decide,
  };
}
