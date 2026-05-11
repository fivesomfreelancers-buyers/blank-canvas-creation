import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Heartbeat: while the tab is visible/focused, ping last_seen every 30s
 * so other users see this user as "Online".
 */
export function usePresence(userId: string | null | undefined) {
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const ping = async () => {
      if (cancelled) return;
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      try {
        await supabase.rpc('touch_last_seen' as any);
      } catch {
        // fallback: direct update of own row
        await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', userId);
      }
    };

    // Initial ping immediately
    ping();
    const interval = setInterval(ping, 30_000);

    const onVisible = () => {
      if (document.visibilityState === 'visible') ping();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [userId]);
}
