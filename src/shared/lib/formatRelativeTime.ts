const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

function plural(count: number, singular: string, pluralForm: string) {
  return `hace ${count} ${count === 1 ? singular : pluralForm}`;
}

// Short relative time as in the mockups: "hace 3 h", "hace 2 días", "hace 1 semana".
export function formatRelativeTime(isoDate: string, now: Date = new Date()): string {
  const elapsed = Math.max(0, now.getTime() - new Date(isoDate).getTime());

  if (elapsed < MINUTE) {
    return 'ahora';
  }
  if (elapsed < HOUR) {
    return `hace ${Math.floor(elapsed / MINUTE)} min`;
  }
  if (elapsed < DAY) {
    return `hace ${Math.floor(elapsed / HOUR)} h`;
  }
  if (elapsed < WEEK) {
    return plural(Math.floor(elapsed / DAY), 'día', 'días');
  }
  if (elapsed < MONTH) {
    return plural(Math.floor(elapsed / WEEK), 'semana', 'semanas');
  }
  if (elapsed < YEAR) {
    return plural(Math.floor(elapsed / MONTH), 'mes', 'meses');
  }
  return plural(Math.floor(elapsed / YEAR), 'año', 'años');
}
