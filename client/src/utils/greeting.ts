const DAY_MS = 24 * 60 * 60 * 1000;
const NEW_ACCOUNT_MS = DAY_MS;
const RETURNING_AFTER_MS = 2 * DAY_MS;

export type GreetingKind = 'new' | 'returning' | 'time';

const lastVisitKey = (userId: string) => `expense-tracker:last-visit:${userId}`;
const sessionKindKey = (userId: string) => `expense-tracker:greeting-kind:${userId}`;

/** Uses the browser's local timezone. */
export const getTimeOfDayWish = (now = new Date()) => {
  const hour = now.getHours();
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
};

export const readLastVisit = (userId: string) => {
  const raw = localStorage.getItem(lastVisitKey(userId));
  const value = raw ? Number(raw) : NaN;
  return Number.isFinite(value) ? value : null;
};

export const writeLastVisit = (userId: string, at = Date.now()) => {
  localStorage.setItem(lastVisitKey(userId), String(at));
};

export const resolveGreetingKind = (
  userId: string,
  createdAtMs: number | null,
  now = Date.now()
): GreetingKind => {
  const cached = sessionStorage.getItem(sessionKindKey(userId));
  if (cached === 'new' || cached === 'returning' || cached === 'time') {
    return cached;
  }

  const lastVisit = readLastVisit(userId);
  let kind: GreetingKind = 'time';

  if (createdAtMs && now - createdAtMs < NEW_ACCOUNT_MS) {
    kind = 'new';
  } else if (lastVisit && now - lastVisit >= RETURNING_AFTER_MS) {
    kind = 'returning';
  }

  sessionStorage.setItem(sessionKindKey(userId), kind);
  return kind;
};

export const clearGreetingSession = (userId: string) => {
  sessionStorage.removeItem(sessionKindKey(userId));
};

export const buildGreeting = (kind: GreetingKind, name: string, now = new Date()) => {
  if (kind === 'new') return `Hi, ${name}!`;
  if (kind === 'returning') return `Welcome back, ${name}!`;
  return `${getTimeOfDayWish(now)}, ${name}!`;
};
