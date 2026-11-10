const MAX_AGE_YEARS = 120;
const DAYS_PER_WEEK = 7;

// `month` goes from 0 (January) to 11 (December).
export type CalendarDate = {
  year: number;
  month: number;
  day: number;
};

export function toIsoDate({ year, month, day }: CalendarDate): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function fromIsoDate(isoDate: string): CalendarDate {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  return { year, month: month - 1, day };
}

// Uses the device's calendar day, which is what "today" means to the person.
export function getToday(now: Date = new Date()): CalendarDate {
  return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
}

export function isFutureDate(date: CalendarDate, today: CalendarDate): boolean {
  return toIsoDate(date) > toIsoDate(today);
}

export function getBirthYears(today: CalendarDate): number[] {
  return Array.from({ length: MAX_AGE_YEARS + 1 }, (_, index) => today.year - index);
}

export function canGoToNextMonth(year: number, month: number, today: CalendarDate): boolean {
  return year < today.year || (year === today.year && month < today.month);
}

export function canGoToPreviousMonth(year: number, month: number, today: CalendarDate): boolean {
  return year > today.year - MAX_AGE_YEARS || month > 0;
}

// Days of a month in a grid of weeks starting on Monday; null marks the empty leading cells.
export function buildMonthCells(year: number, month: number): (number | null)[] {
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const leadingCells = (firstWeekday + DAYS_PER_WEEK - 1) % DAYS_PER_WEEK;

  return [
    ...Array.from({ length: leadingCells }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
}
