import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useAsyncData } from './useAsyncData';

describe('useAsyncData', () => {
  it('starts loading and ends with the data', async () => {
    const load = jest.fn(async () => 'value');
    const { result } = await renderHook(() => useAsyncData(load));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current).toMatchObject({ status: 'success', data: 'value' });
  });

  it('ends with the error when loading fails', async () => {
    const failure = new Error('boom');
    const load = jest.fn(async () => Promise.reject(failure));
    const { result } = await renderHook(() => useAsyncData(load));

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current).toMatchObject({ status: 'error', error: failure });
  });

  it('shows loading again while reloading', async () => {
    let resolveSecond: (value: string) => void = () => undefined;
    const load = jest
      .fn<Promise<string>, []>()
      .mockResolvedValueOnce('first')
      .mockImplementationOnce(() => new Promise((resolve) => (resolveSecond = resolve)));
    const { result } = await renderHook(() => useAsyncData(load));
    await waitFor(() => expect(result.current.status).toBe('success'));

    await act(() => result.current.reload());
    expect(result.current.status).toBe('loading');
    await act(async () => resolveSecond('second'));
    expect(result.current).toMatchObject({ status: 'success', data: 'second' });
  });

  it('loads again on reload', async () => {
    const load = jest
      .fn<Promise<string>, []>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce('value');
    const { result } = await renderHook(() => useAsyncData(load));
    await waitFor(() => expect(result.current.status).toBe('error'));

    await act(() => result.current.reload());
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(load).toHaveBeenCalledTimes(2);
  });
});
