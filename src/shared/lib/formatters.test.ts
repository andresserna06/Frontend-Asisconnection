import { formatLongDate, formatMonthYear } from './formatDate';
import { formatRelativeTime } from './formatRelativeTime';
import { getInitials } from './getInitials';

describe('formatDate', () => {
  it('formats a full date in Spanish', () => {
    expect(formatLongDate('1988-05-14')).toBe('14 de mayo de 1988');
  });

  it('ignores the time part, so the day never shifts', () => {
    expect(formatLongDate('1988-05-14T23:30:00-05:00')).toBe('14 de mayo de 1988');
  });

  it('formats month and year with a capital letter', () => {
    expect(formatMonthYear('2026-03-01')).toBe('Marzo de 2026');
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-10-26T12:00:00Z');
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();
  const HOUR = 3_600_000;
  const DAY = 24 * HOUR;

  it.each([
    [30_000, 'ahora'],
    [5 * 60_000, 'hace 5 min'],
    [3 * HOUR, 'hace 3 h'],
    [DAY, 'hace 1 día'],
    [2 * DAY, 'hace 2 días'],
    [7 * DAY, 'hace 1 semana'],
    [21 * DAY, 'hace 3 semanas'],
    [30 * DAY, 'hace 1 mes'],
    [90 * DAY, 'hace 3 meses'],
    [400 * DAY, 'hace 1 año'],
  ])('%i ms ago -> %s', (elapsed, expected) => {
    expect(formatRelativeTime(ago(elapsed), now)).toBe(expected);
  });

  it('treats future dates as now', () => {
    expect(formatRelativeTime('2026-10-27T12:00:00Z', now)).toBe('ahora');
  });
});

describe('getInitials', () => {
  it('uses the first letter of the first two words', () => {
    expect(getInitials('Marcela Ramírez')).toBe('MR');
    expect(getInitials('Ana Lucía Betancur')).toBe('AL');
  });

  it('handles a single word and extra spaces', () => {
    expect(getInitials('  maria  ')).toBe('M');
  });
});
