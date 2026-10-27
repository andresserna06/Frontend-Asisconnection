import type { CategoryCode } from '@/shared/domain/models/CategoryCode';

// Forum topics. Keys match CategoryKey in shared/theme (colors) and the backend codes.
export type { CategoryCode } from '@/shared/domain/models/CategoryCode';

export type Category = {
  code: CategoryCode;
  // User-facing label (Spanish). Always shown next to the category color.
  label: string;
};

// Single source of truth for category attributes: change them only here.
export const CATEGORIES: Record<CategoryCode, Category> = {
  announcements: { code: 'announcements', label: 'Avisos' },
  questions: { code: 'questions', label: 'Preguntas' },
  guides: { code: 'guides', label: 'Guías' },
  achievements: { code: 'achievements', label: 'Logros' },
};
