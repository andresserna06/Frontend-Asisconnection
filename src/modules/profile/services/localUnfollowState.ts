import { getReactionViewer } from '@/shared/hooks/useReactionToggle';

const STORAGE_KEY = 'asisconnection.unfollowed.v1';
const unfollowedByViewer = new Map<string, Set<string>>();
let isHydrated = false;

function getWebStorage(): Pick<Storage, 'getItem' | 'setItem'> | null {
  try {
    const candidate = (globalThis as { localStorage?: Storage }).localStorage;
    if (
      candidate &&
      typeof candidate.getItem === 'function' &&
      typeof candidate.setItem === 'function'
    ) {
      return candidate;
    }
  } catch {
    // Ignore when web storage is unavailable.
  }
  return null;
}

function hydrateIfNeeded(): void {
  if (isHydrated) {
    return;
  }
  isHydrated = true;
  const storage = getWebStorage();
  if (!storage) {
    return;
  }
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    for (const [viewer, actorIds] of Object.entries(parsed)) {
      if (Array.isArray(actorIds)) {
        unfollowedByViewer.set(
          viewer,
          new Set(actorIds.filter((item): item is string => typeof item === 'string')),
        );
      }
    }
  } catch {
    // Ignore corrupted storage entries.
  }
}

function persistToStorage(): void {
  const storage = getWebStorage();
  if (!storage) {
    return;
  }
  try {
    const serialized: Record<string, string[]> = {};
    for (const [viewer, set] of unfollowedByViewer.entries()) {
      if (set.size > 0) {
        serialized[viewer] = [...set];
      }
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch {
    // Ignore storage quota errors.
  }
}

export function isActorUnfollowed(actorId: string, viewer = getReactionViewer()): boolean {
  hydrateIfNeeded();
  return unfollowedByViewer.get(viewer)?.has(actorId) ?? false;
}

export function markActorUnfollowed(
  actorId: string,
  isUnfollowed: boolean,
  viewer = getReactionViewer(),
): void {
  hydrateIfNeeded();
  let set = unfollowedByViewer.get(viewer);
  if (!set) {
    set = new Set<string>();
    unfollowedByViewer.set(viewer, set);
  }
  if (isUnfollowed) {
    set.add(actorId);
  } else {
    set.delete(actorId);
  }
  persistToStorage();
}

export function countUnfollowedActors(viewer = getReactionViewer()): number {
  hydrateIfNeeded();
  return unfollowedByViewer.get(viewer)?.size ?? 0;
}

export function clearUnfollowedActorsForTests(): void {
  unfollowedByViewer.clear();
  isHydrated = false;
  const storage = getWebStorage();
  try {
    storage?.setItem(STORAGE_KEY, '{}');
  } catch {
    // Ignore in test environments without web storage.
  }
}
