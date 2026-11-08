import type { AssistantService } from '@/modules/assistant/domain/AssistantService';
import type { FaqItem } from '@/modules/assistant/domain/models/Faq';
import type { HttpClient } from '@/shared/lib/http';

type FaqPageResponse = {
  disclaimer: string;
  data: FaqItem[];
};

type EscalateResponse = {
  whatsapp_url: string;
  phone: string;
  message: string;
};

export function createAssistantService(client: HttpClient): AssistantService {
  return {
    async getFaqs(category) {
      const query =
        category !== undefined && category.trim() !== ''
          ? `/assistant/faqs?page=1&limit=50&category=${encodeURIComponent(category.trim())}`
          : '/assistant/faqs?page=1&limit=50';
      const page = await client.request<FaqPageResponse>(query);
      return {
        disclaimer: page.disclaimer,
        items: page.data,
      };
    },

    async escalate(topic) {
      const body = topic !== undefined && topic.trim() !== '' ? { topic: topic.trim() } : {};
      const response = await client.request<EscalateResponse>('/assistant/escalate', {
        method: 'POST',
        body,
      });
      return {
        whatsappUrl: response.whatsapp_url,
        phone: response.phone,
        message: response.message,
      };
    },
  };
}
