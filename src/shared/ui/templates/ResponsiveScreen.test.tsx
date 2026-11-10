import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ResponsiveScreen } from './ResponsiveScreen';

describe('ResponsiveScreen', () => {
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
