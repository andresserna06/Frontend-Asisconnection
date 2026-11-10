import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { EcosystemService } from '@/modules/ecosystem/domain/EcosystemService';
import { createFakeEcosystemService } from '@/modules/ecosystem/testUtils';
import { useEcosystemService } from '@/modules/ecosystem/useEcosystemService';

import { EcosystemScreen } from './EcosystemScreen';

jest.mock('@/modules/ecosystem/useEcosystemService', () => ({
  useEcosystemService: jest.fn(),
}));

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 50, left: 0, right: 0, bottom: 30 },
};

async function renderScreen(service: EcosystemService = createFakeEcosystemService()) {
  jest.mocked(useEcosystemService).mockReturnValue(service);
  await render(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <EcosystemScreen />
    </SafeAreaProvider>,
  );
  return service;
}

describe('EcosystemScreen', () => {
  it('shows the five systems and opens external links returned by the backend directory', async () => {
    const openUrlSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    await renderScreen();

    expect(screen.getByRole('header', { name: 'Ecosistema' })).toBeOnTheScreen();
    expect(screen.getByText('AULA UP')).toBeOnTheScreen();
    expect(screen.getByText('SAGA-UP')).toBeOnTheScreen();
    expect(screen.getByText('SON UP')).toBeOnTheScreen();
    expect(screen.getByText('LUPE')).toBeOnTheScreen();

    const sumaLink = await screen.findByRole('link', { name: /SUMA 21/ });
    await fireEvent.press(sumaLink);

    expect(openUrlSpy).toHaveBeenCalledWith('https://suma21-frontend.onrender.com');
    openUrlSpy.mockRestore();
  });

  it('opens the published systems even when the backend directory is unavailable', async () => {
    const openUrlSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    await renderScreen(
      createFakeEcosystemService({
        listLinks: jest.fn(async () => {
          throw new Error('offline');
        }),
      }),
    );

    await fireEvent.press(await screen.findByRole('link', { name: /AULA UP/ }));
    await fireEvent.press(screen.getByRole('link', { name: /SAGA-UP/ }));

    expect(openUrlSpy).toHaveBeenCalledWith('https://aulaup-bxss.onrender.com/');
    expect(openUrlSpy).toHaveBeenCalledWith('https://saga-up-frontend.onrender.com/login');
    expect(screen.queryByRole('link', { name: /LUPE/ })).toBeNull();
    openUrlSpy.mockRestore();
  });

  it('keeps using the backend directory for the other systems', async () => {
    const openUrlSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    await renderScreen(
      createFakeEcosystemService({
        listLinks: jest.fn(async () => [
          {
            id: 'link-2',
            projectName: 'LUPE',
            url: 'https://lupe.example.test',
            description: 'Proyectos',
          },
        ]),
      }),
    );

    await fireEvent.press(await screen.findByRole('link', { name: /LUPE/ }));

    expect(openUrlSpy).toHaveBeenCalledWith('https://lupe.example.test');
    openUrlSpy.mockRestore();
  });
});
