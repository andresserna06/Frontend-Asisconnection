import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { AssistantService } from '@/modules/assistant/domain/AssistantService';
import { createFakeAssistantService, TEST_ESCALATION_LINK } from '@/modules/assistant/testUtils';
import { useAssistantService } from '@/modules/assistant/useAssistantService';

import { AssistantScreen } from './AssistantScreen';

jest.mock('@/modules/assistant/useAssistantService', () => ({
  useAssistantService: jest.fn(),
}));

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 50, left: 0, right: 0, bottom: 30 },
};

async function renderScreen(service: AssistantService = createFakeAssistantService()) {
  jest.mocked(useAssistantService).mockReturnValue(service);
  await render(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <AssistantScreen />
    </SafeAreaProvider>,
  );
  return service;
}

describe('AssistantScreen', () => {
  it('loads FAQs from the service, displays the answer when selected, and escalates to WhatsApp', async () => {
    const openUrlSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const service = await renderScreen();

    expect(screen.getByRole('header', { name: 'Asistente UP' })).toBeOnTheScreen();
    expect(await screen.findByText(/orientación automatizada/)).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Horarios y sede' }));
    expect(await screen.findByText(/Atendemos de lunes a viernes/)).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Hablar con una persona' }));
    await waitFor(() => expect(service.escalate).toHaveBeenCalledWith('Horarios y sede'));
    expect(openUrlSpy).toHaveBeenCalledWith(TEST_ESCALATION_LINK.whatsappUrl);
    openUrlSpy.mockRestore();
  });
});
