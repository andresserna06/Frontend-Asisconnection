import { useCallback, useEffect, useRef, useState } from 'react';

import type { AdminService } from '@/modules/admin/domain/AdminService';
import type {
  AdminEcosystemLink,
  AdminEcosystemLinkInput,
} from '@/modules/admin/domain/models/AdminEcosystemLink';
import { AdminError } from '@/modules/admin/domain/models/AdminError';
import type { AdminFaqInput, AdminFaqItem } from '@/modules/admin/domain/models/AdminFaqItem';
import type {
  ContentReportDecision,
  ContentReportItem,
  ContentReportsPage,
  ContentReportStatus,
} from '@/modules/admin/domain/models/ContentReportItem';
import type { ModeratorAccount } from '@/modules/admin/domain/models/ModeratorAccount';
import type {
  ModerationDecision,
  ModerationFilter,
  ModerationItem,
  ModerationQueuePage,
} from '@/modules/admin/domain/models/ModerationItem';

export type AdminResource<T> =
  { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: AdminError };

export type AdminSection = 'moderation' | 'reports' | 'users' | 'moderators' | 'faqs' | 'ecosystem';

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
  const [reportFilter, setReportFilterValue] = useState<ContentReportStatus>('OPEN');
  const [queue, setQueue] = useState<AdminResource<ModerationQueuePage>>({ status: 'loading' });
  const [reports, setReports] = useState<AdminResource<ContentReportsPage>>(() =>
    service.listReports
      ? { status: 'loading' }
      : {
          status: 'success',
          data: { items: [], page: 1, totalItems: 0, totalPages: 1, hasNextPage: false },
        },
  );
  const [moderators, setModerators] = useState<AdminResource<ModeratorAccount[]>>({
    status: 'loading',
  });
  const [users, setUsers] = useState<AdminResource<ModeratorAccount[]>>(() =>
    service.listUsers ? { status: 'loading' } : { status: 'success', data: [] },
  );
  const [faqs, setFaqs] = useState<AdminResource<AdminFaqItem[]>>(() =>
    service.listFaqs ? { status: 'loading' } : { status: 'success', data: [] },
  );
  const [ecosystemLinks, setEcosystemLinks] = useState<AdminResource<AdminEcosystemLink[]>>(() =>
    service.listEcosystemLinks ? { status: 'loading' } : { status: 'success', data: [] },
  );
  const [searchResults, setSearchResults] = useState<AdminResource<ModeratorAccount[]> | null>(
    null,
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<AdminError | null>(null);
  const [busyModeratorId, setBusyModeratorId] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [busyReportId, setBusyReportId] = useState<string | null>(null);
  const [busyFaqId, setBusyFaqId] = useState<string | null>(null);
  const [isSavingFaq, setIsSavingFaq] = useState(false);
  const [busyEcosystemLinkId, setBusyEcosystemLinkId] = useState<string | null>(null);
  const [isSavingEcosystemLink, setIsSavingEcosystemLink] = useState(false);
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

  const setReportFilter = useCallback((nextStatus: ContentReportStatus) => {
    setReports({ status: 'loading' });
    setReportFilterValue(nextStatus);
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

  const loadReports = useCallback(
    async (page = 1) => {
      if (!service.listReports) {
        setReports({
          status: 'success',
          data: { items: [], page: 1, totalItems: 0, totalPages: 1, hasNextPage: false },
        });
        return;
      }
      setReports({ status: 'loading' });
      try {
        setReports({ status: 'success', data: await service.listReports(page, reportFilter) });
      } catch (error) {
        setReports({ status: 'error', error: toAdminError(error) });
      }
    },
    [reportFilter, service],
  );

  const loadModerators = useCallback(async () => {
    setModerators({ status: 'loading' });
    try {
      setModerators({ status: 'success', data: await service.listModerators() });
    } catch (error) {
      setModerators({ status: 'error', error: toAdminError(error) });
    }
  }, [service]);

  const loadUsers = useCallback(
    async (query = '') => {
      if (!service.listUsers) {
        setUsers({ status: 'success', data: [] });
        return;
      }
      setUsers({ status: 'loading' });
      try {
        setUsers({ status: 'success', data: await service.listUsers(query) });
      } catch (error) {
        setUsers({ status: 'error', error: toAdminError(error) });
      }
    },
    [service],
  );

  const loadFaqs = useCallback(async () => {
    if (!service.listFaqs) {
      setFaqs({ status: 'success', data: [] });
      return;
    }
    setFaqs({ status: 'loading' });
    try {
      setFaqs({ status: 'success', data: await service.listFaqs() });
    } catch (error) {
      setFaqs({ status: 'error', error: toAdminError(error) });
    }
  }, [service]);

  const loadEcosystemLinks = useCallback(async () => {
    if (!service.listEcosystemLinks) {
      setEcosystemLinks({ status: 'success', data: [] });
      return;
    }
    setEcosystemLinks({ status: 'loading' });
    try {
      setEcosystemLinks({ status: 'success', data: await service.listEcosystemLinks() });
    } catch (error) {
      setEcosystemLinks({ status: 'error', error: toAdminError(error) });
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

  useEffect(() => {
    if (!isEnabled || section !== 'reports' || !service.listReports) {
      return;
    }

    let isActive = true;
    service
      .listReports(1, reportFilter)
      .then((data) => {
        if (isActive) {
          setReports({ status: 'success', data });
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setReports({ status: 'error', error: toAdminError(error) });
        }
      });

    return () => {
      isActive = false;
    };
  }, [isEnabled, reportFilter, section, service]);

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

  useEffect(() => {
    if (!isEnabled || !canManageModerators || section !== 'users' || !service.listUsers) {
      return;
    }

    let isActive = true;
    service
      .listUsers('')
      .then((data) => {
        if (isActive) {
          setUsers({ status: 'success', data });
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setUsers({ status: 'error', error: toAdminError(error) });
        }
      });

    return () => {
      isActive = false;
    };
  }, [canManageModerators, isEnabled, section, service]);

  useEffect(() => {
    if (!isEnabled || !canManageModerators || section !== 'faqs' || !service.listFaqs) {
      return;
    }

    let isActive = true;
    service
      .listFaqs()
      .then((data) => {
        if (isActive) {
          setFaqs({ status: 'success', data });
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setFaqs({ status: 'error', error: toAdminError(error) });
        }
      });

    return () => {
      isActive = false;
    };
  }, [canManageModerators, isEnabled, section, service]);

  useEffect(() => {
    if (
      !isEnabled ||
      !canManageModerators ||
      section !== 'ecosystem' ||
      !service.listEcosystemLinks
    ) {
      return;
    }

    let isActive = true;
    service
      .listEcosystemLinks()
      .then((data) => {
        if (isActive) {
          setEcosystemLinks({ status: 'success', data });
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setEcosystemLinks({ status: 'error', error: toAdminError(error) });
        }
      });

    return () => {
      isActive = false;
    };
  }, [canManageModerators, isEnabled, section, service]);

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

  const resolveReport = useCallback(
    async (report: ContentReportItem, decision: ContentReportDecision) => {
      if (!service.resolveReport) {
        return false;
      }
      setOperationError(null);
      setBusyReportId(report.id);
      try {
        await service.resolveReport(report.id, decision);
        onContentChanged?.();
        await loadReports();
        return true;
      } catch (error) {
        setOperationError(toAdminError(error));
        return false;
      } finally {
        setBusyReportId(null);
      }
    },
    [loadReports, onContentChanged, service],
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

  const createFaq = useCallback(
    async (input: AdminFaqInput) => {
      if (!service.createFaq) {
        return false;
      }
      setOperationError(null);
      setIsSavingFaq(true);
      try {
        await service.createFaq(input);
        await loadFaqs();
        return true;
      } catch (error) {
        setOperationError(toAdminError(error));
        return false;
      } finally {
        setIsSavingFaq(false);
      }
    },
    [loadFaqs, service],
  );

  const updateFaq = useCallback(
    async (id: string, input: AdminFaqInput) => {
      if (!service.updateFaq) {
        return false;
      }
      setOperationError(null);
      setIsSavingFaq(true);
      try {
        await service.updateFaq(id, input);
        await loadFaqs();
        return true;
      } catch (error) {
        setOperationError(toAdminError(error));
        return false;
      } finally {
        setIsSavingFaq(false);
      }
    },
    [loadFaqs, service],
  );

  const deleteFaq = useCallback(
    async (id: string) => {
      if (!service.deleteFaq) {
        return false;
      }
      setOperationError(null);
      setBusyFaqId(id);
      try {
        await service.deleteFaq(id);
        await loadFaqs();
        return true;
      } catch (error) {
        setOperationError(toAdminError(error));
        return false;
      } finally {
        setBusyFaqId(null);
      }
    },
    [loadFaqs, service],
  );

  const createEcosystemLink = useCallback(
    async (input: AdminEcosystemLinkInput) => {
      if (!service.createEcosystemLink) {
        return false;
      }
      setOperationError(null);
      setIsSavingEcosystemLink(true);
      try {
        await service.createEcosystemLink(input);
        await loadEcosystemLinks();
        return true;
      } catch (error) {
        setOperationError(toAdminError(error));
        return false;
      } finally {
        setIsSavingEcosystemLink(false);
      }
    },
    [loadEcosystemLinks, service],
  );

  const updateEcosystemLink = useCallback(
    async (id: string, input: AdminEcosystemLinkInput) => {
      if (!service.updateEcosystemLink) {
        return false;
      }
      setOperationError(null);
      setIsSavingEcosystemLink(true);
      try {
        await service.updateEcosystemLink(id, input);
        await loadEcosystemLinks();
        return true;
      } catch (error) {
        setOperationError(toAdminError(error));
        return false;
      } finally {
        setIsSavingEcosystemLink(false);
      }
    },
    [loadEcosystemLinks, service],
  );

  const deleteEcosystemLink = useCallback(
    async (id: string) => {
      if (!service.deleteEcosystemLink) {
        return false;
      }
      setOperationError(null);
      setBusyEcosystemLinkId(id);
      try {
        await service.deleteEcosystemLink(id);
        await loadEcosystemLinks();
        return true;
      } catch (error) {
        setOperationError(toAdminError(error));
        return false;
      } finally {
        setBusyEcosystemLinkId(null);
      }
    },
    [loadEcosystemLinks, service],
  );

  const updateUserStatus = useCallback(
    async (userAccountId: string, isActive: boolean) => {
      if (!service.updateUserStatus) {
        return false;
      }
      setOperationError(null);
      setBusyUserId(userAccountId);
      try {
        const updated = await service.updateUserStatus(userAccountId, isActive);
        setUsers((current) =>
          current.status === 'success'
            ? {
                status: 'success',
                data: current.data.map((item) => (item.id === updated.id ? updated : item)),
              }
            : current,
        );
        return true;
      } catch (error) {
        setOperationError(toAdminError(error));
        return false;
      } finally {
        setBusyUserId(null);
      }
    },
    [service],
  );

  const toggleUserModerator = useCallback(
    async (userAccountId: string, shouldBeModerator: boolean) => {
      setOperationError(null);
      setBusyUserId(userAccountId);
      try {
        if (shouldBeModerator) {
          await service.assignModerator(userAccountId);
        } else {
          await service.revokeModerator(userAccountId);
        }
        setUsers((current) =>
          current.status === 'success'
            ? {
                status: 'success',
                data: current.data.map((item) =>
                  item.id === userAccountId
                    ? { ...item, localRole: shouldBeModerator ? 'MODERATOR' : null }
                    : item,
                ),
              }
            : current,
        );
        await loadModerators();
        return true;
      } catch (error) {
        setOperationError(toAdminError(error));
        return false;
      } finally {
        setBusyUserId(null);
      }
    },
    [loadModerators, service],
  );

  return {
    section,
    setSection,
    filter,
    setFilter,
    reportFilter,
    setReportFilter,
    queue,
    reports,
    users,
    moderators,
    faqs,
    ecosystemLinks,
    searchResults,
    isLoadingMore,
    loadMoreError,
    busyModeratorId,
    busyUserId,
    busyReportId,
    busyFaqId,
    isSavingFaq,
    busyEcosystemLinkId,
    isSavingEcosystemLink,
    isAssigningModerator,
    operationError,
    loadQueue,
    loadReports,
    loadUsers,
    loadModerators,
    loadFaqs,
    loadEcosystemLinks,
    searchAccounts,
    loadMore,
    updateModerationStatus,
    resolveRemovalRequest,
    resolveReport,
    updateUserStatus,
    toggleUserModerator,
    assignModerator,
    revokeModerator,
    createFaq,
    updateFaq,
    deleteFaq,
    createEcosystemLink,
    updateEcosystemLink,
    deleteEcosystemLink,
  };
}
