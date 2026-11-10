import { act, renderHook } from '@testing-library/react-native';

import {
  applyToggleResult,
  clearRememberedReactionsForTests,
  countReactions,
  useReactionToggle,
} from './useReactionToggle';

beforeEach(() => {
  clearRememberedReactionsForTests();
});

describe('applyToggleResult', () => {
  it('keeps the base when the server confirms the expected state', () => {
    const state = applyToggleResult({ baseCount: 4, wasActive: false, isActive: false }, true);
    expect(state).toEqual({ baseCount: 4, wasActive: false, isActive: true });
    expect(countReactions(state)).toBe(5);
  });

  it('detects a like that was already counted after a reload', () => {
    // The viewer liked before reloading: the server count (5) already includes it.
    const state = applyToggleResult({ baseCount: 5, wasActive: false, isActive: false }, false);
    expect(state).toEqual({ baseCount: 5, wasActive: true, isActive: false });
    expect(countReactions(state)).toBe(4);
  });
});

describe('useReactionToggle', () => {
  it('never counts the same like twice', async () => {
    let serverActive = true; // already liked before the screen opened
    const request = jest.fn(async () => {
      serverActive = !serverActive;
      return serverActive;
    });
    const { result } = await renderHook(() => useReactionToggle(5, request, 'post:1'));

    await act(async () => {
      result.current.toggle();
    });
    expect(result.current).toMatchObject({ count: 4, isActive: false });

    await act(async () => {
      result.current.toggle();
    });
    expect(result.current).toMatchObject({ count: 5, isActive: true });
  });

  it('remembers the active reaction across remounts and reloads', async () => {
    const request = jest.fn(async () => true);
    const firstMount = await renderHook(() => useReactionToggle(0, request, 'comment:42'));

    await act(async () => {
      firstMount.result.current.toggle();
    });
    expect(firstMount.result.current).toMatchObject({ count: 1, isActive: true });
    await firstMount.unmount();

    // Reopening the sheet after the server count updated to 1 keeps it marked without adding +1 again.
    const secondMount = await renderHook(() => useReactionToggle(1, request, 'comment:42'));
    expect(secondMount.result.current).toMatchObject({ count: 1, isActive: true });
  });

  it('restores the previous state when the request fails', async () => {
    const request = jest.fn(async () => {
      throw new Error('network');
    });
    const { result } = await renderHook(() => useReactionToggle(2, request, 'post:2'));

    await act(async () => {
      result.current.toggle();
    });
    expect(result.current).toMatchObject({ count: 2, isActive: false, isPending: false });
  });
});
