import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

jest.mock('@/modules/auth', () => ({
  getPrimaryRole: () => ({ label: 'Acudiente' }),
  useAuth: () => ({
    user: { username: 'test.user', roles: ['ACUDIENTE'] },
  }),
}));

import { NewPostScreen } from './NewPostScreen';

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 50, left: 0, right: 0, bottom: 30 },
};

describe('NewPostScreen', () => {
  it('renders the composer and lets the user choose a topic', async () => {
    await render(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <NewPostScreen />
      </SafeAreaProvider>,
    );

    expect(screen.getByRole('header', { name: 'Nueva publicación' })).toBeOnTheScreen();
    expect(screen.getByRole('textbox', { name: 'Escribe tu publicación' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('radio', { name: 'Logros' }));

    expect(screen.getByRole('radio', { name: 'Logros' })).toHaveProp('accessibilityState', {
      checked: true,
    });
  });

  it('accepts text in the local draft without submitting to a service', async () => {
    await render(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <NewPostScreen />
      </SafeAreaProvider>,
    );

    const input = screen.getByRole('textbox', { name: 'Escribe tu publicación' });
    await fireEvent.changeText(input, 'Una idea para la comunidad');

    expect(input).toHaveProp('value', 'Una idea para la comunidad');
  });
});
