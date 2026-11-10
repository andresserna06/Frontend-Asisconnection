import { useCallback, useEffect, useRef, useState } from 'react';

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

function getItemKey(item: ModerationItem): string {
  return `${item.itemType}:${item.id}`;
}

export function useAdminDashboard(
  service: AdminService,
  isEnabled = true,
  canManageModerators = isEnabled,
  onContentChanged?: () => void,
) {
  const [section, setSection] = useState<AdminSection>('moderation');
  const [filter, setFilterValue] = useState<ModerationFilter>('ALL');
  const [queue, setQueue] = useState<AdminResource<ModerationQueuePage>>({ status: 'loading' });
  const [moderators, setModerators] = useState<AdminResource<ModeratorAccount[]>>({
    status: 'loading',
  });
  const [searchResults, setSearchResults] = useState<AdminResource<ModeratorAccount[]> | null>(
    null,
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<AdminError | null>(null);
  const [busyModeratorId, setBusyModeratorId] = useState<string | null>(null);
  const [isAssigningModerator, setIsAssigningModerator] = useState(false);
  const [operationError, setOperationError] = useState<AdminError | null>(null);
  // Only the latest listing counts, so a slow response cannot overwrite a newer one.
  const queueRequestRef = useRef(0);
  // Items decided here: a stale listing cannot bring them back or let them be decided twice.
  const decidedKeysRef = useRef(new Set<string>());

  const withoutDecided = useCallback((page: ModerationQueuePage): ModerationQueuePage => {
    const seenKeys = new Set<string>();
    const items = page.items.filter((item) => {
      const key = getItemKey(item);
      if (decidedKeysRef.current.has(key) || seenKeys.has(key)) {
        return false;
      }
      seenKeys.add(key);
      return true;
    });
    return {
      ...page,
      items,
      totalItems: Math.max(0, page.totalItems - (page.items.length - items.length)),
    };
  }, []);

  const setFilter = useCallback((nextFilter: ModerationFilter) => {
    setQueue({ status: 'loading' });
    setLoadMoreError(null);
    setFilterValue(nextFilter);
  }, []);

  const loadQueue = useCallback(
    async (page = 1) => {
      queueRequestRef.current += 1;
      const requestId = queueRequestRef.current;
      setQueue({ status: 'loading' });
      setLoadMoreError(null);
      try {
        const data = await service.listPending(page, filter);
        if (requestId === queueRequestRef.current) {
          setQueue({ status: 'success', data: withoutDecided(data) });
        }
      } catch (error) {
        if (requestId === queueRequestRef.current) {
          setQueue({ status: 'error', error: toAdminError(error) });
        }
      }
    },
    [filter, service, withoutDecided],
  );

  const loadModerators = useCallback(async () => {
    setModerators({ status: 'loading' });
    try {
      setModerators({ status: 'success', data: await service.listModerators() });
    } catch (error) {
      setModerators({ status: 'error', error: toAdminError(error) });
    }
  }, [service]);

  const searchAccounts = useCallback(
    async (query: string) => {
      if (!service.searchAccounts) {
        return;
      }
      setSearchResults({ status: 'loading' });
      try {
        const accounts = await service.searchAccounts(query);
        setSearchResults({ status: 'success', data: accounts });
      } catch (error) {
        setSearchResults({ status: 'error', error: toAdminError(error) });
      }
    },
    [service],
  );

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    queueRequestRef.current += 1;
    const requestId = queueRequestRef.current;
    service
      .listPending(1, filter)
      .then((data) => {
        if (requestId === queueRequestRef.current) {
          setQueue({ status: 'success', data: withoutDecided(data) });
        }
      })
      .catch((error: unknown) => {
        if (requestId === queueRequestRef.current) {
          setQueue({ status: 'error', error: toAdminError(error) });
        }
      });

    return () => {
      queueRequestRef.current += 1;
    };
  }, [filter, isEnabled, service, withoutDecided]);

  // Deciding every visible item leaves the next page to be fetched, without a spinner.
  const hasEmptiedPage =
    queue.status === 'success' && queue.data.items.length === 0 && queue.data.hasNextPage;

  useEffect(() => {
    if (!hasEmptiedPage) {
      return;
    }

    queueRequestRef.current += 1;
    const requestId = queueRequestRef.current;
    service
      .listPending(1, filter)
      .then((data) => {
        if (requestId === queueRequestRef.current) {
          setQueue({ status: 'success', data: withoutDecided(data) });
        }
      })
      .catch(() => undefined);
  }, [filter, hasEmptiedPage, service, withoutDecided]);

  useEffect(() => {
    if (!isEnabled || !canManageModerators) {
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
  }, [canManageModerators, isEnabled, service]);

  const loadMore = useCallback(async () => {
    if (queue.status !== 'success' || !queue.data.hasNextPage || isLoadingMore) {
      return;
    }

    const requestId = queueRequestRef.current;
    setIsLoadingMore(true);
    setLoadMoreError(null);
    try {
      const nextPage = await service.listPending(queue.data.page + 1, filter);
      setQueue((current) =>
        current.status === 'success' && requestId === queueRequestRef.current
          ? {
              status: 'success',
              data: withoutDecided({
                ...nextPage,
                items: [...current.data.items, ...nextPage.items],
              }),
            }
          : current,
      );
    } catch (error) {
      setLoadMoreError(toAdminError(error));
    } finally {
      setIsLoadingMore(false);
    }
  }, [filter, isLoadingMore, queue, service, withoutDecided]);

  // The item leaves the queue at once; it only comes back if the server refuses the decision.
  const decideItem = useCallback(
    async (item: ModerationItem, submit: () => Promise<void>) => {
      const key = getItemKey(item);
      if (decidedKeysRef.current.has(key)) {
        return false;
      }

      decidedKeysRef.current.add(key);
      setOperationError(null);
      setQueue((current) =>
        current.status === 'success'
          ? {
              status: 'success',
              data: {
                ...current.data,
                items: current.data.items.filter((entry) => getItemKey(entry) !== key),
                totalItems: Math.max(0, current.data.totalItems - 1),
              },
            }
          : current,
      );

      try {
        await submit();
        onContentChanged?.();
        return true;
      } catch (error) {
        const adminError = toAdminError(error);
        setOperationError(adminError);
        // Not found means someone else already handled it: there is nothing to bring back.
        if (adminError.kind !== 'notFound') {
          decidedKeysRef.current.delete(key);
          setQueue((current) =>
            current.status === 'success'
              ? {
                  status: 'success',
                  data: {
                    ...current.data,
                    items: [item, ...current.data.items],
                    totalItems: current.data.totalItems + 1,
                  },
                }
              : current,
          );
        }
        return false;
      }
    },
    [onContentChanged],
  );

  const updateModerationStatus = useCallback(
    (item: ModerationItem, status: ModerationDecision) =>
      decideItem(item, () => service.updateModerationStatus(item.id, item.itemType, status)),
    [decideItem, service],
  );

  // Hiding rejects the target; either way the request itself leaves the queue.
  const resolveRemovalRequest = useCallback(
    (item: ModerationItem, shouldHide: boolean) =>
      decideItem(item, async () => {
        const removal = item.removalRequest;
        if (shouldHide && removal?.kind === 'post' && item.postId) {
          await service.updateModerationStatus(item.postId, 'POST', 'REJECTED');
        }
        if (shouldHide && removal?.kind === 'comment') {
          await service.updateModerationStatus(removal.commentId, 'COMMENT', 'REJECTED');
        }
        await service.updateModerationStatus(item.id, 'COMMENT', 'REJECTED');
      }),
    [decideItem, service],
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
    searchResults,
    isLoadingMore,
    loadMoreError,
    busyModeratorId,
    isAssigningModerator,
    operationError,
    loadQueue,
    loadModerators,
    searchAccounts,
    loadMore,
    updateModerationStatus,
    resolveRemovalRequest,
    assignModerator,
    revokeModerator,
  };
}
