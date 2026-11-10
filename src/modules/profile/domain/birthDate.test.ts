import {
  buildMonthCells,
  canGoToNextMonth,
  canGoToPreviousMonth,
  fromIsoDate,
  getBirthYears,
  getToday,
  isFutureDate,
  toIsoDate,
} from './birthDate';

const TODAY = { year: 2026, month: 10, day: 10 };

describe('birthDate', () => {
  it('converts between calendar dates and ISO dates', () => {
    expect(toIsoDate({ year: 1988, month: 4, day: 4 })).toBe('1988-05-04');
    expect(fromIsoDate('1988-05-14T00:00:00Z')).toEqual({ year: 1988, month: 4, day: 14 });
  });

  it('takes today from the local calendar of the device', () => {
    expect(getToday(new Date(2026, 10, 10, 23, 59))).toEqual(TODAY);
  });

  it('treats only the days after today as future', () => {
    expect(isFutureDate(TODAY, TODAY)).toBe(false);
    expect(isFutureDate({ ...TODAY, day: 11 }, TODAY)).toBe(true);
    expect(isFutureDate({ year: 2026, month: 9, day: 31 }, TODAY)).toBe(false);
    expect(isFutureDate({ year: 2027, month: 0, day: 1 }, TODAY)).toBe(true);
  });

  it('offers years up to the current one, newest first', () => {
    const years = getBirthYears(TODAY);

    expect(years[0]).toBe(2026);
    expect(years.at(-1)).toBe(1906);
  });

  it('stops the navigation at the current month and at the oldest year', () => {
    expect(canGoToNextMonth(2026, 10, TODAY)).toBe(false);
    expect(canGoToNextMonth(2026, 9, TODAY)).toBe(true);
    expect(canGoToNextMonth(2025, 11, TODAY)).toBe(true);
    expect(canGoToPreviousMonth(1906, 0, TODAY)).toBe(false);
    expect(canGoToPreviousMonth(1906, 1, TODAY)).toBe(true);
  });

  it('builds the month grid starting on Monday', () => {
    // November 2026 starts on a Sunday and February 2024 is a leap month starting on a Thursday.
    expect(buildMonthCells(2026, 10).slice(0, 7)).toEqual([null, null, null, null, null, null, 1]);
    expect(buildMonthCells(2024, 1).filter((cell) => cell !== null)).toHaveLength(29);
    expect(buildMonthCells(2024, 1).slice(0, 4)).toEqual([null, null, null, 1]);
  });
});
