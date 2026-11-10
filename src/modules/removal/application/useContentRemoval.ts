import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/modules/auth';
import type { RemovalTarget } from '@/modules/removal/domain/models/RemovalTarget';
import { useRemovalService } from '@/modules/removal/useRemovalService';
import { readDeviceValue, writeDeviceValue } from '@/shared/lib/deviceStorage';

const GUEST_VIEWER = 'guest';
const GUEST_CONTENT_KEY = 'asisconnection.guest-content.v1';
const hiddenContentKey = (viewer: string) => `asisconnection.hidden-content.v1.${viewer}`;
const EMPTY_IDS: string[] = [];

async function readIds(key: string): Promise<string[]> {
  return (await readDeviceValue<string[]>(key)) ?? [];
}

// A guest has no account: what they published is known only by the ids kept on this device.
export async function rememberGuestContent(id: string): Promise<void> {
  await writeDeviceValue(GUEST_CONTENT_KEY, [...(await readIds(GUEST_CONTENT_KEY)), id]);
}

export function useContentRemoval() {
  const { status, user, isAnonymous } = useAuth();
  const service = useRemovalService();
  const queryClient = useQueryClient();
  const viewer = status === 'signedIn' ? (isAnonymous ? GUEST_VIEWER : user?.username) : undefined;
  const hiddenQueryKey = ['removal', 'hidden', viewer];

  const hidden = useQuery({
    queryKey: hiddenQueryKey,
    enabled: viewer !== undefined,
    queryFn: () => readIds(hiddenContentKey(viewer ?? GUEST_VIEWER)),
  });
  const guestContent = useQuery({
    queryKey: ['removal', 'guestContent'],
    enabled: status === 'signedIn' && isAnonymous,
    queryFn: () => readIds(GUEST_CONTENT_KEY),
  });

  const hiddenIds = hidden.data ?? EMPTY_IDS;
  const guestIds = guestContent.data ?? EMPTY_IDS;
  const isModerator =
    !isAnonymous && (user?.roles.some((role) => role === 'ADMIN' || role === 'MODERATOR') ?? false);

  function canRemove(target: RemovalTarget): boolean {
    if (status !== 'signedIn') {
      return false;
    }
    if (isModerator) {
      return true;
    }
    if (isAnonymous) {
      return guestIds.includes(target.id);
    }
    return target.authorProfileId !== null && target.authorName === user?.username;
  }

  async function remove(target: RemovalTarget): Promise<void> {
    if (isModerator) {
      await service.hideForEveryone(target);
    } else if (isAnonymous) {
      await service.requestRemoval(target);
    } else {
      await service.removeOwnContent(target);
    }

    if (viewer !== undefined) {
      const key = hiddenContentKey(viewer);
      const nextIds = [...(await readIds(key)), target.id];
      await writeDeviceValue(key, nextIds);
      queryClient.setQueryData(hiddenQueryKey, nextIds);
    }
    void queryClient.invalidateQueries({ queryKey: ['forum', 'feed'] });
    void queryClient.invalidateQueries({ queryKey: ['comments'] });
  }

  return {
    removesForEveryone: !isAnonymous,
    canRemove,
    remove,
    isHidden: (id: string) => hiddenIds.includes(id),
  };
}
