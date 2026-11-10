import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { useResponsiveLayout } from '@/shared/hooks/useResponsiveLayout';

import { ResponsiveScreen } from './ResponsiveScreen';

jest.mock('@/shared/hooks/useResponsiveLayout', () => ({
  useResponsiveLayout: jest.fn(() => ({ isDesktop: false, hasAside: false })),
}));

describe('ResponsiveScreen', () => {
  it('ignores the side panel outside wide desktop windows', async () => {
    await render(
      <ResponsiveScreen aside={<Text>Side panel</Text>}>
        <Text>Responsive content</Text>
      </ResponsiveScreen>,
    );

    expect(screen.queryByText('Side panel')).toBeNull();
  });

  it('uses the requested column width and shows the side panel on wide desktop', async () => {
    jest.mocked(useResponsiveLayout).mockReturnValueOnce({ isDesktop: true, hasAside: true });

    await render(
      <ResponsiveScreen aside={<Text>Side panel</Text>} desktopWidth={640}>
        <Text>Responsive content</Text>
      </ResponsiveScreen>,
    );

    expect(screen.getByText('Responsive content').parent).toHaveStyle({ maxWidth: 640 });
    expect(screen.getByText('Side panel')).toBeOnTheScreen();
  });

  it('centers content within a tablet-friendly maximum width', async () => {
    await render(
      <ResponsiveScreen>
        <Text>Responsive content</Text>
      </ResponsiveScreen>,
    );

    expect(screen.getByText('Responsive content').parent).toHaveStyle({
      width: '100%',
      maxWidth: 840,
      alignSelf: 'center',
    });
  });
});
