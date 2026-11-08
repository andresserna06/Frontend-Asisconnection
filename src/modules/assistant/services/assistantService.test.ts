import { createHttpClient } from '@/shared/lib/http';

import { createAssistantService } from './assistantService';

const BASE_URL = 'https://api.example.test/v1';
const fetchMock = jest.spyOn(globalThis, 'fetch');

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  fetchMock.mockReset();
});

afterAll(() => {
  fetchMock.mockRestore();
});

describe('createAssistantService', () => {
  it('fetches FAQs and disclaimer from GET /assistant/faqs', async () => {
    const service = createAssistantService(createHttpClient(BASE_URL));
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        disclaimer: 'Orientación informativa.',
        data: [
          {
            id: 'faq-1',
            question: '¿Cómo me inscribo?',
            answer: 'En la sede principal.',
            category: 'Inscripciones',
          },
        ],
        meta: { page: 1, limit: 50, total: 1, total_pages: 1 },
      }),
    );

    await expect(service.getFaqs()).resolves.toEqual({
      disclaimer: 'Orientación informativa.',
      items: [
        {
          id: 'faq-1',
          question: '¿Cómo me inscribo?',
          answer: 'En la sede principal.',
          category: 'Inscripciones',
        },
      ],
    });
    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE_URL}/assistant/faqs?page=1&limit=50`);
  });

  it('requests a WhatsApp escalation link from POST /assistant/escalate', async () => {
    const service = createAssistantService(createHttpClient(BASE_URL));
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        whatsapp_url: 'https://wa.me/573001234567?text=Hola',
        phone: '573001234567',
        message: 'Hola',
      }),
    );

    await expect(service.escalate('Talleres')).resolves.toEqual({
      whatsappUrl: 'https://wa.me/573001234567?text=Hola',
      phone: '573001234567',
      message: 'Hola',
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/assistant/escalate`);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({ topic: 'Talleres' });
  });
});
