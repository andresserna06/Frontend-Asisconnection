export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

export type FaqCatalog = {
  disclaimer: string;
  items: FaqItem[];
};

export type EscalationLink = {
  whatsappUrl: string;
  phone: string;
  message: string;
};
