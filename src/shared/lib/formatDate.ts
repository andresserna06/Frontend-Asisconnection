const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

// Reads the date part of an ISO string ("1988-05-14" or "1988-05-14T10:00:00Z") without
// time zones, so a birthday never moves one day back.
function parseDate(isoDate: string) {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  return { year, monthName: MONTHS[month - 1], day };
}

// "14 de mayo de 1988".
export function formatLongDate(isoDate: string): string {
  const { year, monthName, day } = parseDate(isoDate);
  return `${day} de ${monthName} de ${year}`;
}

// "Marzo de 2026".
export function formatMonthYear(isoDate: string): string {
  const { year, monthName } = parseDate(isoDate);
  return `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} de ${year}`;
}
