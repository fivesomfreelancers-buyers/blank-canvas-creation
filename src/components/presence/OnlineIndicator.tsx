import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  userId: string | null | undefined;
  /** Pre-fetched last_seen ISO string (optional, avoids extra query). */
  lastSeen?: string | null;
  /** Show a small dot only (no text). */
  dotOnly?: boolean;
  className?: string;
}

const ONLINE_WINDOW_MS = 2 * 60 * 1000; // <=2 min => online

const formatLastSeen = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'Online';
  if (mins < 60) return `Last seen ${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Last seen ${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `Last seen ${days}d ago`;
};

const OnlineIndicator: React.FC<Props> = ({ userId, lastSeen, dotOnly, className }) => {
  const [seen, setSeen] = useState<string | null>(lastSeen ?? null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (lastSeen !== undefined) {
      setSeen(lastSeen);
      return;
    }
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any)
        .from('public_profiles')
        .select('last_seen')
        .eq('id', userId)
        .maybeSingle();
      if (!cancelled) setSeen(data?.last_seen || null);
    })();
    return () => { cancelled = true; };
  }, [userId, lastSeen]);

  // Re-render every 30s so labels stay current.
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const isOnline = !!seen && (Date.now() - new Date(seen).getTime() <= ONLINE_WINDOW_MS);

  if (dotOnly) {
    return (
      <span
        title={seen ? formatLastSeen(seen) : 'Offline'}
        className={`inline-block w-2.5 h-2.5 rounded-full ring-2 ring-background ${isOnline ? 'bg-green-500' : 'bg-muted-foreground/40'} ${className || ''}`}
      />
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${className || ''}`}>
      <span className={`inline-block w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
      <span className={isOnline ? 'text-green-600 dark:text-green-400 font-medium' : 'text-muted-foreground'}>
        {isOnline ? 'Online' : seen ? formatLastSeen(seen) : 'Offline'}
      </span>
    </span>
  );
};

export default OnlineIndicator;
