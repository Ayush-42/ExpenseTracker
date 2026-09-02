import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  buildGreeting,
  resolveGreetingKind,
  writeLastVisit,
  type GreetingKind,
} from '../utils/greeting';

const createdAtMs = (creationTime?: string | null) => {
  if (!creationTime) return null;
  const value = Date.parse(creationTime);
  return Number.isFinite(value) ? value : null;
};

export const useGreeting = (name: string) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid ?? null;
  const [kind, setKind] = useState<GreetingKind>('time');
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!userId) {
      setKind('time');
      return;
    }

    const nextKind = resolveGreetingKind(userId, createdAtMs(currentUser?.metadata.creationTime));
    setKind(nextKind);
    writeLastVisit(userId);

    const onVisible = () => {
      if (document.visibilityState === 'visible') writeLastVisit(userId);
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      writeLastVisit(userId);
    };
  }, [userId, currentUser?.metadata.creationTime]);

  useEffect(() => {
    if (kind !== 'time') return undefined;

    const tick = () => setNow(new Date());
    tick();
    const interval = window.setInterval(tick, 60_000);
    return () => window.clearInterval(interval);
  }, [kind]);

  return useMemo(() => buildGreeting(kind, name, now), [kind, name, now]);
};
