import type { AssistantService } from '@/modules/assistant/domain/AssistantService';
import type { EscalationLink, FaqCatalog } from '@/modules/assistant/domain/models/Faq';

export const TEST_FAQ_CATALOG: FaqCatalog = {
  disclaimer:
    'Esta orientación automatizada es de carácter informativo y no reemplaza la atención profesional.',
  items: [
    {
      id: 'faq-1',
      question: 'Horarios y sede',
      answer: 'Atendemos de lunes a viernes de 8:00 a. m. a 5:00 p. m. en Manizales.',
      category: 'Horarios y sede',
    },
  ],
};

export const TEST_ESCALATION_LINK: EscalationLink = {
  whatsappUrl: 'https://wa.me/573001234567?text=Hola',
  phone: '573001234567',
  message: 'Hola',
};

export function createFakeAssistantService(
  overrides: Partial<AssistantService> = {},
): AssistantService {
  return {
    getFaqs: jest.fn(async () => TEST_FAQ_CATALOG),
    escalate: jest.fn(async () => TEST_ESCALATION_LINK),
    ...overrides,
  };
}
