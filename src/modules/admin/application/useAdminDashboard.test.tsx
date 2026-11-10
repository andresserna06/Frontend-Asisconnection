import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { AdminService } from '@/modules/admin/domain/AdminService';
import type { ModerationQueuePage } from '@/modules/admin/domain/models/ModerationItem';

import { useAdminDashboard } from './useAdminDashboard';

const queuePage: ModerationQueuePage = {
  items: [],
  page: 1,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
};

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
