import { format, subDays, differenceInDays, parseISO, startOfDay } from 'date-fns';

export function today(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function daysAgo(n: number): string {
  return format(subDays(new Date(), n), 'yyyy-MM-dd');
}

export function daysBetween(dateA: string, dateB: string): number {
  return Math.abs(differenceInDays(parseISO(dateA), parseISO(dateB)));
}

export function formatDate(date: string, fmt: string = 'MMM d, yyyy'): string {
  return format(parseISO(date), fmt);
}

export function dateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = startOfDay(parseISO(startDate));
  const end = startOfDay(parseISO(endDate));
  const days = differenceInDays(end, start);
  for (let i = 0; i <= days; i++) {
    dates.push(format(subDays(end, days - i), 'yyyy-MM-dd'));
  }
  return dates;
}

export function msToHours(ms: number): number {
  return Math.round((ms / 3600000) * 10) / 10;
}

export function msToMinutes(ms: number): number {
  return Math.round(ms / 60000);
}
