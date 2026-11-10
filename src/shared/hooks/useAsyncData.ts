import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type AsyncData<T> =
  { status: 'loading' } | { status: 'error'; error: unknown } | { status: 'success'; data: T };

type Settled<T> = Exclude<AsyncData<T>, { status: 'loading' }>;

export type AsyncDataControls = {
  // Shows the loading state and loads again (e.g. "Reintentar").
  reload(): void;
  // Loads again in the background, keeping the current data on screen until it arrives.
  refresh(): void;
};

// Loads data when the screen opens and whenever `load` changes, so `load` must be stable
// (wrap it in useCallback). Minimal on purpose: TanStack Query replaces it from T-06 on.
export function useAsyncData<T>(load: () => Promise<T>): AsyncData<T> & AsyncDataControls {
  const [attempt, setAttempt] = useState(0);
  // A new object per request: a result only counts if it belongs to the current request.
  const request = useMemo(() => ({ load, attempt }), [load, attempt]);
  const [result, setResult] = useState<{ request: object; value: Settled<T> } | null>(null);
  const currentRequest = useRef(request);

  useEffect(() => {
    currentRequest.current = request;
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

  const refresh = useCallback(() => {
    const target = currentRequest.current;
    target.load().then(
      (data) => {
        if (currentRequest.current === target) {
          setResult({ request: target, value: { status: 'success', data } });
        }
      },
      // A failed background refresh keeps the data already shown.
      () => undefined,
    );
  }, []);

  const state: AsyncData<T> = result?.request === request ? result.value : { status: 'loading' };

  return { ...state, reload, refresh };
}
