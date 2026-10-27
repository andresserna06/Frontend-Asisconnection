import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BottomNavBar } from './BottomNavBar';

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 50, left: 0, right: 0, bottom: 30 },
};

describe('BottomNavBar', () => {
  it('renders all routes and navigates to the selected destination', async () => {
    const onNavigate = jest.fn();

    await render(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <BottomNavBar activeRoute="index" profileInitials="AS" onNavigate={onNavigate} />
      </SafeAreaProvider>,
    );

    for (const label of ['Foros', 'Ecosistema', 'Asistente', 'Perfil']) {
      expect(screen.getByRole('tab', { name: label })).toBeOnTheScreen();
    }

    await fireEvent.press(screen.getByRole('tab', { name: 'Asistente' }));

    expect(onNavigate).toHaveBeenCalledWith('assistant');
  });

  it('keeps Foros selected while notifications is open', async () => {
    await render(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <BottomNavBar activeRoute="notifications" profileInitials="AS" onNavigate={jest.fn()} />
      </SafeAreaProvider>,
    );

    expect(screen.getByRole('tab', { name: 'Foros' })).toHaveProp('accessibilityState', {
      selected: true,
    });
  });
});
