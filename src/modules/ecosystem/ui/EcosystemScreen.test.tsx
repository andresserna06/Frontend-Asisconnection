import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { EcosystemScreen } from './EcosystemScreen';

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 50, left: 0, right: 0, bottom: 30 },
};

describe('EcosystemScreen', () => {
  it('shows the five systems without activating external navigation', async () => {
    await render(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <EcosystemScreen />
      </SafeAreaProvider>,
    );

    expect(screen.getByRole('header', { name: 'Ecosistema' })).toBeOnTheScreen();
    expect(screen.getByText('Los otros sistemas de la fundación.')).toBeOnTheScreen();
    expect(screen.getByText('SUMA 21')).toBeOnTheScreen();
    expect(screen.getByText('AULA UP')).toBeOnTheScreen();
    expect(screen.getByText('SAGA-UP')).toBeOnTheScreen();
    expect(screen.getByText('SON UP')).toBeOnTheScreen();
    expect(screen.getByText('LUPE')).toBeOnTheScreen();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
