import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { TEST_PROFILE } from '@/modules/profile/testUtils';

import { EditProfileModal } from './EditProfileModal';

async function renderModal(birthDate: string | null, onSave = jest.fn(async () => undefined)) {
  await render(
    <EditProfileModal
      visible
      profile={{ ...TEST_PROFILE, birthDate }}
      onClose={jest.fn()}
      onSave={onSave}
    />,
  );
  return onSave;
}

describe('EditProfileModal', () => {
  it('picks a birth date from the calendar and saves it in ISO format', async () => {
    const onSave = await renderModal('1988-05-14');

    await fireEvent.press(
      screen.getByRole('button', { name: 'Fecha de nacimiento: 14 de mayo de 1988' }),
    );
    await fireEvent.press(screen.getByRole('button', { name: '20 de mayo de 1988' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ birthDate: '1988-05-20' })),
    );
  });

  it('starts by the year when there is no date and never offers the future', async () => {
    await renderModal(null);
    const currentYear = new Date().getFullYear();

    await fireEvent.press(screen.getByRole('button', { name: /^Fecha de nacimiento/ }));

    expect(screen.queryByRole('button', { name: String(currentYear + 1) })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: String(currentYear) }));

    expect(screen.getByRole('button', { name: 'Mes siguiente' })).toBeDisabled();
  });
});
