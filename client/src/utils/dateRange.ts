export type DateRangePreset = 'this-month' | 'last-month' | 'custom';

export interface DateRange {
  start: Date;
  end: Date;
}

export const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

export const endOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

export const today = () => startOfDay(new Date());

export const startOfMonth = (date: Date) => startOfDay(new Date(date.getFullYear(), date.getMonth(), 1));

export const endOfMonth = (date: Date) =>
  endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));

export const addMonths = (date: Date, amount: number) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isBeforeDay = (a: Date, b: Date) => startOfDay(a).getTime() < startOfDay(b).getTime();

export const isAfterDay = (a: Date, b: Date) => startOfDay(a).getTime() > startOfDay(b).getTime();

export const clampToToday = (date: Date) => {
  const latest = today();
  return isAfterDay(date, latest) ? latest : startOfDay(date);
};

export const thisMonthRange = (): DateRange => {
  const now = new Date();
  return { start: startOfMonth(now), end: endOfDay(now) };
};

export const lastMonthRange = (): DateRange => {
  const last = addMonths(new Date(), -1);
  return { start: startOfMonth(last), end: endOfMonth(last) };
};

export const rangeForPreset = (preset: DateRangePreset, custom?: DateRange | null): DateRange => {
  if (preset === 'last-month') return lastMonthRange();
  if (preset === 'custom' && custom) {
    const start = startOfDay(custom.start);
    const end = endOfDay(clampToToday(custom.end));
    return isAfterDay(start, end) ? { start: startOfDay(end), end: endOfDay(start) } : { start, end };
  }
  return thisMonthRange();
};

export const inclusiveDayCount = (range: DateRange) => {
  const start = startOfDay(range.start).getTime();
  const end = startOfDay(range.end).getTime();
  return Math.floor((end - start) / 86_400_000) + 1;
};

export const isInRange = (date: Date, range: DateRange) => {
  const time = date.getTime();
  return time >= range.start.getTime() && time <= range.end.getTime();
};

export const formatRangeLabel = (range: DateRange) => {
  const sameYear = range.start.getFullYear() === range.end.getFullYear();
  const startLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  }).format(range.start);
  const endLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(range.end);
  return `${startLabel} – ${endLabel}`;
};

export const weekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const monthTitle = (date: Date) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);

export const getMonthGrid = (month: Date) => {
  const first = startOfMonth(month);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const leading = first.getDay();
  const cells: Array<Date | null> = Array.from({ length: leading }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(first.getFullYear(), first.getMonth(), day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
};
