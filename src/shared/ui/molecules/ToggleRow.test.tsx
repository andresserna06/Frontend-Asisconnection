import { fireEvent, render, screen } from '@testing-library/react-native';

import { ToggleRow } from './ToggleRow';

describe('ToggleRow', () => {
  it('exposes one switch and toggles once per press', async () => {
    const onToggle = jest.fn();

    await render(
      <ToggleRow label="Ciudad" valueLabel="Solo yo" isEnabled={false} onToggle={onToggle} />,
    );
    await fireEvent.press(screen.getByRole('switch', { name: 'Ciudad', checked: false }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
