import { describe, expect, it } from 'vitest';
import {
  buildDayClassesLayout,
  buildWeekFromDate,
  decimalToHourString,
  formatDateForInput,
  getMondayOfWeek,
  toHourDecimal,
} from '../scheduleUtils';

describe('scheduleUtils', () => {
  it('formats dates for input in YYYY-MM-DD', () => {
    const result = formatDateForInput(new Date('2026-05-09T12:00:00'));

    expect(result).toBe('2026-05-09');
  });

  it('gets the monday of the week for any input date', () => {
    const monday = getMondayOfWeek(new Date('2026-05-09T12:00:00'));

    expect(formatDateForInput(monday)).toBe('2026-05-04');
  });

  it('builds a full week starting on monday', () => {
    const week = buildWeekFromDate(new Date('2026-05-09T12:00:00'));

    expect(week).toHaveLength(7);
    expect(week[0].day).toBe('SEGUNDA');
    expect(week[0].date).toBe('4');
    expect(formatDateForInput(week[6].fullDate)).toBe('2026-05-10');
  });

  it('converts between hour strings and decimals', () => {
    expect(toHourDecimal('08:30')).toBe(8.5);
    expect(decimalToHourString(8.5)).toBe('08:30');
  });

  it('calculates overlap layout for classes in the same cluster', () => {
    const layout = buildDayClassesLayout([
      { id: 1, start: 8, duration: 1 },
      { id: 2, start: 8.5, duration: 1 },
      { id: 3, start: 10, duration: 1 },
    ]);

    expect(layout[1]).toEqual({ column: 0, columns: 2 });
    expect(layout[2]).toEqual({ column: 1, columns: 2 });
    expect(layout[3]).toEqual({ column: 0, columns: 1 });
  });
});
