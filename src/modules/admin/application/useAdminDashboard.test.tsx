import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { AdminService } from '@/modules/admin/domain/AdminService';
import { AdminError } from '@/modules/admin/domain/models/AdminError';
import type {
  ModerationItem,
  ModerationQueuePage,
} from '@/modules/admin/domain/models/ModerationItem';

import { useAdminDashboard } from './useAdminDashboard';

const queuePage: ModerationQueuePage = {
  items: [],
  page: 1,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
};

const ITEM: ModerationItem = {
  id: 'post-1',
  itemType: 'POST',
  content: 'Pendiente',
  imageUrl: null,
  author: { displayName: 'persona', roleLabel: 'ACUDIENTE', isRegistered: true },
  createdAt: '2026-11-09T12:00:00.000Z',
};
const PAGE_WITH_ITEM: ModerationQueuePage = { ...queuePage, items: [ITEM], totalItems: 1 };

function createService(overrides: Partial<AdminService> = {}): AdminService {
  return {
    listPending: jest.fn(async () => queuePage),
    updateModerationStatus: jest.fn(async () => undefined),
    listModerators: jest.fn(async () => []),
    assignModerator: jest.fn(async () => undefined),
    revokeModerator: jest.fn(async () => undefined),
    ...overrides,
  };
}

describe('useAdminDashboard', () => {
  it('loads the queue and applies the selected item filter', async () => {
    const service = createService();
    const { result } = await renderHook(() => useAdminDashboard(service));

    await waitFor(() => expect(result.current.queue.status).toBe('success'));
    await act(async () => {
      result.current.setFilter('COMMENT');
    });
    await waitFor(() => expect(service.listPending).toHaveBeenLastCalledWith(1, 'COMMENT'));
  });

  it('takes a decided item out of the queue at once and refreshes the content', async () => {
    let finishApproval = () => undefined as void;
    const service = createService({
      listPending: jest.fn(async () => PAGE_WITH_ITEM),
      updateModerationStatus: jest.fn(
        () => new Promise<void>((resolve) => (finishApproval = resolve)),
      ),
    });
    const onContentChanged = jest.fn();
    const { result } = await renderHook(() =>
      useAdminDashboard(service, true, true, onContentChanged),
    );
    await waitFor(() => expect(result.current.queue.status).toBe('success'));

    let approval: Promise<boolean> = Promise.resolve(false);
    await act(async () => {
      approval = result.current.updateModerationStatus(ITEM, 'APPROVED');
    });

    expect(result.current.queue).toMatchObject({ data: { items: [], totalItems: 0 } });
    expect(onContentChanged).not.toHaveBeenCalled();

    await act(async () => {
      finishApproval();
      await approval;
    });

    expect(onContentChanged).toHaveBeenCalledTimes(1);
  });

  it('sends a decision only once when it is pressed twice', async () => {
    const service = createService({ listPending: jest.fn(async () => PAGE_WITH_ITEM) });
    const { result } = await renderHook(() => useAdminDashboard(service));
    await waitFor(() => expect(result.current.queue.status).toBe('success'));

    await act(async () => {
      await Promise.all([
        result.current.updateModerationStatus(ITEM, 'APPROVED'),
        result.current.updateModerationStatus(ITEM, 'APPROVED'),
      ]);
    });

    expect(service.updateModerationStatus).toHaveBeenCalledTimes(1);
  });

  it('does not bring back a decided item from a later listing', async () => {
    const service = createService({ listPending: jest.fn(async () => PAGE_WITH_ITEM) });
    const { result } = await renderHook(() => useAdminDashboard(service));
    await waitFor(() => expect(result.current.queue.status).toBe('success'));
    await act(async () => {
      await result.current.updateModerationStatus(ITEM, 'APPROVED');
    });

    await act(async () => {
      await result.current.loadQueue();
    });

    expect(result.current.queue).toMatchObject({ data: { items: [] } });
  });

  it('puts the item back and shows the error when the server refuses', async () => {
    const service = createService({
      listPending: jest.fn(async () => PAGE_WITH_ITEM),
      updateModerationStatus: jest.fn(async () => {
        throw new AdminError('network');
      }),
    });
    const { result } = await renderHook(() => useAdminDashboard(service));
    await waitFor(() => expect(result.current.queue.status).toBe('success'));

    await act(async () => {
      await result.current.updateModerationStatus(ITEM, 'APPROVED');
    });

    expect(result.current.queue).toMatchObject({ data: { items: [ITEM], totalItems: 1 } });
    expect(result.current.operationError?.kind).toBe('network');
  });

  it('exposes an action error instead of hiding a failed moderator assignment', async () => {
    const service = createService({
      assignModerator: jest.fn(async () => {
        throw new Error('request failed');
      }),
    });
    const { result } = await renderHook(() => useAdminDashboard(service));

    await waitFor(() => expect(result.current.moderators.status).toBe('success'));
    await act(async () => {
      await result.current.assignModerator('account-id');
    });

    expect(result.current.operationError?.kind).toBe('unknown');
  });
});
