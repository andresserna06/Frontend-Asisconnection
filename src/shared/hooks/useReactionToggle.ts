import { useRef, useState } from 'react';

type ReactionState = {
  viewerKey: string;
  // Count sent by the server the last time the list was loaded.
  baseCount: number;
  // Whether that count already included the viewer's reaction.
  wasActive: boolean;
  isActive: boolean;
};

export type ReactionToggle = {
  count: number;
  isActive: boolean;
  isPending: boolean;
  toggle(): void;
};

const STORAGE_KEY = 'asisconnection.reactions.v2';
const memoryReactions = new Map<string, boolean>();
let isHydratedFromStorage = false;
let currentViewerId = 'default';

export function setReactionViewer(viewerId: string | null | undefined): void {
  const normalized = viewerId?.trim().toLowerCase();
  currentViewerId = normalized && normalized.length > 0 ? normalized : 'guest';
}

export function getReactionViewer(): string {
  return currentViewerId;
}

function toScopedKey(reactionKey?: string, viewerId = currentViewerId): string | undefined {
  if (!reactionKey) {
    return undefined;
  }
  return `${viewerId}:${reactionKey}`;
}

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
    // Web storage may be unavailable in private mode or native runtimes.
  }
  return null;
}

function hydrateReactionsIfNeeded() {
  if (isHydratedFromStorage) {
    return;
  }
  isHydratedFromStorage = true;
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
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'boolean') {
        memoryReactions.set(key, value);
      }
    }
  } catch {
    // Ignore corrupted storage entries.
  }
}

export function getRememberedReaction(reactionKey?: string, viewerId = currentViewerId): boolean {
  const scoped = toScopedKey(reactionKey, viewerId);
  if (!scoped) {
    return false;
  }
  hydrateReactionsIfNeeded();
  return memoryReactions.get(scoped) ?? false;
}

export function rememberReaction(
  reactionKey: string | undefined,
  isActive: boolean,
  viewerId = currentViewerId,
): void {
  const scoped = toScopedKey(reactionKey, viewerId);
  if (!scoped) {
    return;
  }
  hydrateReactionsIfNeeded();
  memoryReactions.set(scoped, isActive);
  const storage = getWebStorage();
  if (!storage) {
    return;
  }
  try {
    const serialized: Record<string, boolean> = {};
    for (const [key, value] of memoryReactions.entries()) {
      if (value) {
        serialized[key] = true;
      }
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch {
    // Ignore storage quota errors.
  }
}

export function clearRememberedReactionsForTests(): void {
  memoryReactions.clear();
  isHydratedFromStorage = false;
  currentViewerId = 'default';
  const storage = getWebStorage();
  try {
    storage?.setItem(STORAGE_KEY, '{}');
  } catch {
    // Ignore in test environments without web storage.
  }
}

// Pure rule, exported for tests: given what we believed before the tap and what the
// server answered (`active`), returns the corrected state.
export function applyToggleResult<T extends { wasActive: boolean; isActive: boolean }>(
  before: T,
  isActive: boolean,
): T {
  // The server ended in the same state we believed we started from: our belief was wrong,
  // so the reaction was the opposite before the tap (e.g. already counted after a reload).
  const wasActive = before.isActive === isActive ? !isActive : before.wasActive;
  return { ...before, wasActive, isActive };
}

export function countReactions(state: {
  baseCount: number;
  wasActive: boolean;
  isActive: boolean;
}): number {
  return Math.max(0, state.baseCount - (state.wasActive ? 1 : 0) + (state.isActive ? 1 : 0));
}

// The backend counts reactions but does not say whether the viewer already reacted.
// The real state is learned from the answer of the toggle endpoint and remembered per
// viewer + `reactionKey`, so each account sees only its own likes.
export function useReactionToggle(
  serverCount: number,
  request: () => Promise<boolean>,
  reactionKey?: string,
): ReactionToggle {
  const viewerKey = toScopedKey(reactionKey) ?? currentViewerId;
  const [state, setState] = useState<ReactionState>(() => {
    const remembered = getRememberedReaction(reactionKey) && serverCount > 0;
    return {
      viewerKey,
      baseCount: serverCount,
      wasActive: remembered,
      isActive: remembered,
    };
  });
  const [isPending, setIsPending] = useState(false);
  const isPendingRef = useRef(false);

  let current = state;
  if (viewerKey !== state.viewerKey) {
    // The active account changed: load only the new viewer's remembered reaction.
    const remembered = getRememberedReaction(reactionKey) && serverCount > 0;
    current = {
      viewerKey,
      baseCount: serverCount,
      wasActive: remembered,
      isActive: remembered,
    };
    setState(current);
  } else if (serverCount !== state.baseCount) {
    // The list was reloaded for the same viewer: the new count already reflects the last known reaction.
    const remembered = getRememberedReaction(reactionKey);
    const activeAfterReload = (state.isActive || remembered) && serverCount > 0;
    current = {
      viewerKey,
      baseCount: serverCount,
      wasActive: activeAfterReload,
      isActive: activeAfterReload,
    };
    setState(current);
  }

  function toggle() {
    if (isPendingRef.current) {
      return;
    }
    const activeViewer = currentViewerId;
    const before = current;
    const optimisticActive = !before.isActive;
    isPendingRef.current = true;
    setIsPending(true);
    rememberReaction(reactionKey, optimisticActive, activeViewer);
    setState({ ...before, isActive: optimisticActive });

    request()
      .then((isActive) => {
        rememberReaction(reactionKey, isActive, activeViewer);
        setState(applyToggleResult(before, isActive));
      })
      .catch(() => {
        rememberReaction(reactionKey, before.isActive, activeViewer);
        setState(before);
      })
      .finally(() => {
        isPendingRef.current = false;
        setIsPending(false);
      });
  }

  return { count: countReactions(current), isActive: current.isActive, isPending, toggle };
}
