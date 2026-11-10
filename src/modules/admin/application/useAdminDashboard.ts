import { useCallback, useEffect, useState } from 'react';

import type { AdminService } from '@/modules/admin/domain/AdminService';
import { AdminError } from '@/modules/admin/domain/models/AdminError';
import type { ModeratorAccount } from '@/modules/admin/domain/models/ModeratorAccount';
import type {
  ModerationDecision,
  ModerationFilter,
  ModerationItem,
  ModerationQueuePage,
} from '@/modules/admin/domain/models/ModerationItem';

export type AdminResource<T> =
  { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: AdminError };

export type AdminSection = 'moderation' | 'moderators';

function toAdminError(error: unknown): AdminError {
  return error instanceof AdminError ? error : new AdminError('unknown');
}

export function useAdminDashboard(service: AdminService, isEnabled = true) {
  const [section, setSection] = useState<AdminSection>('moderation');
  const [filter, setFilterValue] = useState<ModerationFilter>('ALL');
  const [queue, setQueue] = useState<AdminResource<ModerationQueuePage>>({ status: 'loading' });
  const [moderators, setModerators] = useState<AdminResource<ModeratorAccount[]>>({
    status: 'loading',
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<AdminError | null>(null);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [busyModeratorId, setBusyModeratorId] = useState<string | null>(null);
  const [isAssigningModerator, setIsAssigningModerator] = useState(false);
  const [operationError, setOperationError] = useState<AdminError | null>(null);

  const setFilter = useCallback((nextFilter: ModerationFilter) => {
    setQueue({ status: 'loading' });
    setLoadMoreError(null);
    setFilterValue(nextFilter);
  }, []);

  const loadQueue = useCallback(
    async (page = 1) => {
      setQueue({ status: 'loading' });
      setLoadMoreError(null);
      try {
        setQueue({ status: 'success', data: await service.listPending(page, filter) });
      } catch (error) {
        setQueue({ status: 'error', error: toAdminError(error) });
      }
    },
    [filter, service],
  );

  const loadModerators = useCallback(async () => {
    setModerators({ status: 'loading' });
    try {
      setModerators({ status: 'success', data: await service.listModerators() });
    } catch (error) {
      setModerators({ status: 'error', error: toAdminError(error) });
    }
  }, [service]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    let isActive = true;
    service
      .listPending(1, filter)
      .then((data) => {
        if (isActive) {
          setQueue({ status: 'success', data });
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setQueue({ status: 'error', error: toAdminError(error) });
        }
      });

    return () => {
      isActive = false;
    };
  }, [filter, isEnabled, service]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    let isActive = true;
    service
      .listModerators()
      .then((data) => {
        if (isActive) {
          setModerators({ status: 'success', data });
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setModerators({ status: 'error', error: toAdminError(error) });
        }
      });

    return () => {
      isActive = false;
    };
  }, [isEnabled, service]);

  const loadMore = useCallback(async () => {
    if (queue.status !== 'success' || !queue.data.hasNextPage || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setLoadMoreError(null);
    try {
      const nextPage = await service.listPending(queue.data.page + 1, filter);
      setQueue((current) =>
        current.status === 'success'
          ? {
              status: 'success',
              data: { ...nextPage, items: [...current.data.items, ...nextPage.items] },
            }
          : current,
      );
    } catch (error) {
      setLoadMoreError(toAdminError(error));
    } finally {
      setIsLoadingMore(false);
    }
  }, [filter, isLoadingMore, queue, service]);

  const updateModerationStatus = useCallback(
    async (item: ModerationItem, status: ModerationDecision) => {
      setOperationError(null);
      setBusyItemId(item.id);
      try {
        await service.updateModerationStatus(item.id, item.itemType, status);
        await loadQueue();
        return true;
      } catch (error) {
        setOperationError(toAdminError(error));
        return false;
      } finally {
        setBusyItemId(null);
      }
    },
    [loadQueue, service],
  );

  const assignModerator = useCallback(
    async (userAccountId: string) => {
      setOperationError(null);
      setIsAssigningModerator(true);
      try {
        await service.assignModerator(userAccountId);
        await loadModerators();
        return true;
      } catch (error) {
        setOperationError(toAdminError(error));
        return false;
      } finally {
        setIsAssigningModerator(false);
      }
    },
    [loadModerators, service],
  );

  const revokeModerator = useCallback(
    async (userAccountId: string) => {
      setOperationError(null);
      setBusyModeratorId(userAccountId);
      try {
        await service.revokeModerator(userAccountId);
        await loadModerators();
        return true;
      } catch (error) {
        setOperationError(toAdminError(error));
        return false;
      } finally {
        setBusyModeratorId(null);
      }
    },
    [loadModerators, service],
  );

  return {
    section,
    setSection,
    filter,
    setFilter,
    queue,
    moderators,
    isLoadingMore,
    loadMoreError,
    busyItemId,
    busyModeratorId,
    isAssigningModerator,
    operationError,
    loadQueue,
    loadModerators,
    loadMore,
    updateModerationStatus,
    assignModerator,
    revokeModerator,
  };
}
