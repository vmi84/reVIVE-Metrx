import {
  today,
  daysAgo,
  daysBetween,
  formatDate,
  dateRange,
  msToHours,
  msToMinutes,
} from '../date';

describe('today', () => {
  it('returns YYYY-MM-DD format', () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('matches current date', () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(today()).toBe(expected);
  });
});

describe('daysAgo', () => {
  it('returns today for 0 days ago', () => {
    expect(daysAgo(0)).toBe(today());
  });

  it('returns YYYY-MM-DD format', () => {
    expect(daysAgo(7)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns a date in the past', () => {
    const result = daysAgo(1);
    expect(result).not.toBe(today());
  });
});

describe('daysBetween', () => {
  it('returns 0 for same date', () => {
    expect(daysBetween('2024-01-15', '2024-01-15')).toBe(0);
  });

  it('returns positive value regardless of order', () => {
    expect(daysBetween('2024-01-01', '2024-01-10')).toBe(9);
    expect(daysBetween('2024-01-10', '2024-01-01')).toBe(9);
  });

  it('handles month boundaries', () => {
    expect(daysBetween('2024-01-31', '2024-02-01')).toBe(1);
  });
});

describe('formatDate', () => {
  it('uses default format MMM d, yyyy', () => {
    expect(formatDate('2024-06-15')).toBe('Jun 15, 2024');
  });

  it('supports custom format', () => {
    expect(formatDate('2024-06-15', 'yyyy/MM/dd')).toBe('2024/06/15');
  });

  it('handles single-digit days', () => {
    expect(formatDate('2024-01-05')).toBe('Jan 5, 2024');
  });
});

describe('dateRange', () => {
  it('returns single date for same start and end', () => {
    const result = dateRange('2024-01-01', '2024-01-01');
    expect(result).toEqual(['2024-01-01']);
  });

  it('returns inclusive range', () => {
    const result = dateRange('2024-01-01', '2024-01-03');
    expect(result).toEqual(['2024-01-01', '2024-01-02', '2024-01-03']);
  });

  it('returns correct count', () => {
    const result = dateRange('2024-01-01', '2024-01-07');
    expect(result).toHaveLength(7);
  });
});

describe('msToHours', () => {
  it('converts 0 ms to 0 hours', () => {
    expect(msToHours(0)).toBe(0);
  });

  it('converts 3600000 ms to 1 hour', () => {
    expect(msToHours(3600000)).toBe(1);
  });

  it('rounds to one decimal', () => {
    // 5400000 ms = 1.5 hours
    expect(msToHours(5400000)).toBe(1.5);
  });

  it('handles large values', () => {
    // 28800000 ms = 8 hours
    expect(msToHours(28800000)).toBe(8);
  });
});

describe('msToMinutes', () => {
  it('converts 0 ms to 0 minutes', () => {
    expect(msToMinutes(0)).toBe(0);
  });

  it('converts 60000 ms to 1 minute', () => {
    expect(msToMinutes(60000)).toBe(1);
  });

  it('rounds to nearest minute', () => {
    expect(msToMinutes(90000)).toBe(2); // 1.5 min rounds to 2
    expect(msToMinutes(30000)).toBe(1); // 0.5 min rounds to 1
  });
});
