export type CategoryCode = 'announcements' | 'questions' | 'guides' | 'achievements';

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Maps a backend category (name / main_topic from GET /categories) to a frontend CategoryCode.
export function toCategoryCode(name: string, mainTopic = ''): CategoryCode | null {
  const haystack = `${normalize(name)} ${normalize(mainTopic)}`;
  if (
    haystack.includes('noticia') ||
    haystack.includes('institucional') ||
    haystack.includes('aviso')
  ) {
    return 'announcements';
  }
  if (haystack.includes('salud') || haystack.includes('pregunta')) {
    return 'questions';
  }
  if (haystack.includes('pedagog') || haystack.includes('educaci') || haystack.includes('guia')) {
    return 'guides';
  }
  if (
    haystack.includes('voluntaria') ||
    haystack.includes('comunidad') ||
    haystack.includes('logro')
  ) {
    return 'achievements';
  }
  return null;
}
