import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useAuth } from '@/modules/auth';
import type { RoleCode } from '@/modules/auth';
import { useRemovalService } from '@/modules/removal/useRemovalService';
import { createHttpClient } from '@/shared/lib/http';

import { rememberGuestContent, useContentRemoval } from './useContentRemoval';

jest.mock('@/modules/auth', () => ({ useAuth: jest.fn() }));
jest.mock('@/modules/removal/useRemovalService', () => ({ useRemovalService: jest.fn() }));

const MINE = { kind: 'post', id: 'p-1', authorName: 'persona', authorProfileId: 'a-1' } as const;
const OTHER = { kind: 'post', id: 'p-2', authorName: 'otra', authorProfileId: 'a-2' } as const;
const GUEST_POST = {
  kind: 'post',
  id: 'p-3',
  authorName: 'Invitado',
  authorProfileId: null,
} as const;

function setup(roles: RoleCode[], isAnonymous = false) {
  const service = {
    hideForEveryone: jest.fn(async () => undefined),
    removeOwnContent: jest.fn(async () => undefined),
    requestRemoval: jest.fn(async () => undefined),
  };
  jest.mocked(useRemovalService).mockReturnValue(service);
  jest.mocked(useAuth).mockReturnValue({
    status: 'signedIn',
    user: { username: 'persona', roles },
    isAnonymous,
    signIn: async () => undefined,
    signInAnonymous: async () => undefined,
    registerAccount: async () => undefined,
    signOut: async () => undefined,
    authorizedClient: createHttpClient('https://api.example.test'),
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { service, wrapper };
}

describe('useContentRemoval', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('lets moderators remove any content for everyone', async () => {
    const { service, wrapper } = setup(['MODERATOR']);
    const { result } = await renderHook(() => useContentRemoval(), { wrapper });

    expect(result.current.canRemove(OTHER)).toBe(true);
    await act(async () => result.current.remove(OTHER));

    expect(service.hideForEveryone).toHaveBeenCalledWith(OTHER);
    expect(service.requestRemoval).not.toHaveBeenCalled();
    await waitFor(() => expect(result.current.isHidden('p-2')).toBe(true));
  });

  it('lets a registered person remove only their own content, for everyone', async () => {
    const { service, wrapper } = setup(['ACUDIENTE']);
    const { result } = await renderHook(() => useContentRemoval(), { wrapper });

    expect(result.current.canRemove(OTHER)).toBe(false);
    expect(result.current.canRemove(MINE)).toBe(true);
    await act(async () => result.current.remove(MINE));

    expect(service.removeOwnContent).toHaveBeenCalledWith(MINE);
    expect(service.requestRemoval).not.toHaveBeenCalled();
    expect(service.hideForEveryone).not.toHaveBeenCalled();
    await waitFor(() => expect(result.current.isHidden('p-1')).toBe(true));
  });

  it('lets a guest remove only what was published from this device', async () => {
    await rememberGuestContent('p-3');
    const { service, wrapper } = setup(['BENEFICIARIO'], true);
    const { result } = await renderHook(() => useContentRemoval(), { wrapper });

    await waitFor(() => expect(result.current.canRemove(GUEST_POST)).toBe(true));
    expect(result.current.canRemove({ ...GUEST_POST, id: 'p-9' })).toBe(false);

    await act(async () => result.current.remove(GUEST_POST));
    expect(service.requestRemoval).toHaveBeenCalledWith(GUEST_POST);
  });

  it('does not hide anything when the request fails', async () => {
    const { service, wrapper } = setup(['ACUDIENTE']);
    service.removeOwnContent.mockRejectedValueOnce(new Error('network'));
    const { result } = await renderHook(() => useContentRemoval(), { wrapper });

    await act(async () => {
      await expect(result.current.remove(MINE)).rejects.toThrow('network');
    });

    expect(result.current.isHidden('p-1')).toBe(false);
  });
});
