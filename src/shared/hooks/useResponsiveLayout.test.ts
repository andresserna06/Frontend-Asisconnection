import { renderHook } from '@testing-library/react-native';
import { Platform, useWindowDimensions } from 'react-native';

import { useResponsiveLayout } from './useResponsiveLayout';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const originalOS = Platform.OS;

function setWindow(os: typeof Platform.OS, width: number) {
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });
  jest.mocked(useWindowDimensions).mockReturnValue({
    width,
    height: 900,
    scale: 1,
    fontScale: 1,
  });
}

describe('useResponsiveLayout', () => {
  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalOS });
  });

  it('never enters the desktop layout on native, even on very wide screens', async () => {
    setWindow('android', 1600);

    const { result } = await renderHook(() => useResponsiveLayout());

    expect(result.current).toEqual({ isDesktop: false, hasAside: false });
  });

  it('keeps the mobile layout in narrow browser windows', async () => {
    setWindow('web', 1023);

    const { result } = await renderHook(() => useResponsiveLayout());

    expect(result.current.isDesktop).toBe(false);
  });

  it('uses the desktop layout without side panel from 1024 px', async () => {
    setWindow('web', 1024);

    const { result } = await renderHook(() => useResponsiveLayout());

    expect(result.current).toEqual({ isDesktop: true, hasAside: false });
  });

  it('adds the side panel from 1280 px', async () => {
    setWindow('web', 1280);

    const { result } = await renderHook(() => useResponsiveLayout());

    expect(result.current).toEqual({ isDesktop: true, hasAside: true });
  });
});
