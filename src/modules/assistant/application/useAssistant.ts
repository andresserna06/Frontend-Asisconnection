import { useEffect, useState } from 'react';

import type { AssistantService } from '@/modules/assistant/domain/AssistantService';
import type { EscalationLink, FaqCatalog, FaqItem } from '@/modules/assistant/domain/models/Faq';

export type AssistantTurn = {
  id: string;
  question: string;
  answer: string;
};

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function findMatchingFaq(items: FaqItem[], option: string): FaqItem | null {
  const target = normalize(option);
  return (
    items.find(
      (item) =>
        normalize(item.question) === target ||
        normalize(item.category) === target ||
        normalize(item.question).includes(target) ||
        normalize(item.category).includes(target),
    ) ?? null
  );
}

export function useAssistant(service: AssistantService) {
  const [catalog, setCatalog] = useState<FaqCatalog | null>(null);
  const [turns, setTurns] = useState<AssistantTurn[]>([]);
  const [lastTopic, setLastTopic] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isActive = true;

    service
      .getFaqs()
      .then((loaded) => {
        if (isActive) {
          setCatalog(loaded);
        }
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, [service]);

  function selectOption(option: string): boolean {
    setLastTopic(option);
    const match = findMatchingFaq(catalog?.items ?? [], option);
    if (match === null) {
      return false;
    }

    setTurns((current) => [
      ...current,
      {
        id: `${match.id}-${current.length + 1}`,
        question: match.question,
        answer: match.answer,
      },
    ]);
    return true;
  }

  function reset() {
    setTurns([]);
    setLastTopic(undefined);
  }

  async function escalate(): Promise<EscalationLink> {
    return service.escalate(lastTopic);
  }

  return {
    disclaimer: catalog?.disclaimer ?? null,
    faqs: catalog?.items ?? [],
    turns,
    selectOption,
    reset,
    escalate,
  };
}
