import type { EscalationLink, FaqCatalog } from './models/Faq';

export type AssistantService = {
  getFaqs(category?: string): Promise<FaqCatalog>;
  escalate(topic?: string): Promise<EscalationLink>;
};
