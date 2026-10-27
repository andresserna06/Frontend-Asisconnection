import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AssistantScreen } from './AssistantScreen';

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 50, left: 0, right: 0, bottom: 30 },
};

describe('AssistantScreen', () => {
  it('shows the introductory view and FAQ options without simulated answers', async () => {
    await render(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <AssistantScreen />
      </SafeAreaProvider>,
    );

    expect(screen.getByRole('header', { name: 'Asistente UP' })).toBeOnTheScreen();
    expect(screen.getByText(/Hola\. Soy el asistente de la fundación/)).toBeOnTheScreen();
    expect(screen.getByText(/pendientes de confirmación/)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Horarios y sede' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Hablar con una persona' })).toBeOnTheScreen();
  });
});
