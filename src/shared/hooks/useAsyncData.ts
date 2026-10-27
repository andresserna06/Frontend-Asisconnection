import { useCallback, useEffect, useMemo, useState } from 'react';

export type AsyncData<T> =
  { status: 'loading' } | { status: 'error'; error: unknown } | { status: 'success'; data: T };

type Settled<T> = Exclude<AsyncData<T>, { status: 'loading' }>;

// Loads data when the screen opens and whenever `load` changes, so `load` must be stable
// (wrap it in useCallback). Minimal on purpose: TanStack Query replaces it from T-06 on.
export function useAsyncData<T>(load: () => Promise<T>): AsyncData<T> & { reload(): void } {
  const [attempt, setAttempt] = useState(0);
  // A new object per request: a result only counts if it belongs to the current request.
  const request = useMemo(() => ({ load, attempt }), [load, attempt]);
  const [result, setResult] = useState<{ request: object; value: Settled<T> } | null>(null);

  useEffect(() => {
    let isActive = true;
    request.load().then(
      (data) => isActive && setResult({ request, value: { status: 'success', data } }),
      (error: unknown) => isActive && setResult({ request, value: { status: 'error', error } }),
    );
    return () => {
      isActive = false;
    };
  }, [request]);

  const reload = useCallback(() => setAttempt((current) => current + 1), []);
  const state: AsyncData<T> = result?.request === request ? result.value : { status: 'loading' };

  return { ...state, reload };
}
