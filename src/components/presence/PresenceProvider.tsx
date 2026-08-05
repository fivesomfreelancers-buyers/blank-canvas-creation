import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PresenceCtx {
  /** User ids currently connected to the site via Realtime presence. */
  onlineIds: Set<string>;
  isOnline: (userId: string | null | undefined) => boolean;
}

const PresenceContext = createContext<PresenceCtx>({
  onlineIds: new Set(),
  isOnline: () => false,
});

export const usePresenceContext = () => useContext(PresenceContext);

const TOPIC = 'presence:global';
const HEARTBEAT_MS = 45_000;

/**
 * Global presence:
 * - One Realtime presence channel tells every client, in real time, who has the
 *   site open (works across tabs and survives client-side navigation).
 * - Signed-in users `track()` themselves; anonymous visitors only read state.
 * - Subscribes only after auth has resolved and the Realtime socket has the auth
 *   token, which avoids the duplicate `phx_join` that makes the server close the
 *   channel (that was the cause of the random Online/Offline flicker).
 * - Self-healing: any CLOSED / CHANNEL_ERROR / TIMED_OUT status, tab focus, or
 *   network `online` event triggers a rejoin with backoff.
 * - `profiles.last_seen` heartbeat is kept as a fallback signal.
 */
export const PresenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, isLoading } = useAuth();
  const userId = user?.id ?? null;
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const anonKeyRef = useRef(`anon-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (isLoading) return; // wait until we know whether there is a session

    let disposed = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let rejoinTimer: ReturnType<typeof setTimeout> | null = null;
    let keepAlive: ReturnType<typeof setInterval> | null = null;
    let attempt = 0;

    const presenceKey = userId ?? anonKeyRef.current;

    const syncState = () => {
      if (!channel) return;
      const state = channel.presenceState<{ user_id?: string }>();
      const ids = new Set<string>();
      Object.entries(state).forEach(([key, metas]) => {
        (metas as Array<{ user_id?: string }>).forEach((m) => {
          const id = m.user_id || key;
          if (id && !id.startsWith('anon-')) ids.add(id);
        });
      });
      setOnlineIds(ids);
    };

    const track = async () => {
      if (!userId || !channel || channel.state !== 'joined') return;
      try {
        await channel.track({ user_id: userId, online_at: new Date().toISOString() });
      } catch {
        /* rejoin logic will recover */
      }
    };

    const scheduleRejoin = () => {
      if (disposed || rejoinTimer) return;
      const delay = Math.min(1000 * 2 ** attempt, 15_000);
      attempt += 1;
      rejoinTimer = setTimeout(() => {
        rejoinTimer = null;
        join();
      }, delay);
    };

    const join = async () => {
      if (disposed) return;
      if (channel) {
        const stale = channel;
        channel = null;
        try {
          await supabase.removeChannel(stale);
        } catch {
          /* ignore */
        }
      }

      // Make sure the socket carries the current JWT *before* joining, so the
      // client never has to re-join the same topic with a new token.
      try {
        await (supabase.realtime as any).setAuth?.();
      } catch {
        /* anon key is used when there is no session */
      }
      if (disposed) return;

      const ch = supabase.channel(TOPIC, { config: { presence: { key: presenceKey } } });
      channel = ch;

      ch.on('presence', { event: 'sync' }, syncState)
        .on('presence', { event: 'join' }, syncState)
        .on('presence', { event: 'leave' }, syncState)
        .subscribe((status) => {
          if (disposed || channel !== ch) return;
          if (status === 'SUBSCRIBED') {
            attempt = 0;
            void track();
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            scheduleRejoin();
          }
        });
    };

    const ensureAlive = () => {
      if (disposed) return;
      if (!channel || channel.state !== 'joined') scheduleRejoin();
      else void track();
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') ensureAlive();
    };

    void join();

    // Refresh our presence meta periodically and repair a dead channel.
    keepAlive = setInterval(ensureAlive, HEARTBEAT_MS);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', ensureAlive);
    window.addEventListener('online', ensureAlive);

    return () => {
      disposed = true;
      if (keepAlive) clearInterval(keepAlive);
      if (rejoinTimer) clearTimeout(rejoinTimer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', ensureAlive);
      window.removeEventListener('online', ensureAlive);
      if (channel) {
        const ch = channel;
        channel = null;
        void (async () => {
          try {
            await ch.untrack();
          } catch {
            /* ignore */
          }
          try {
            await supabase.removeChannel(ch);
          } catch {
            /* ignore */
          }
        })();
      }
      setOnlineIds(new Set());
    };
    // Re-create the channel when the signed-in identity changes (login/logout).
  }, [userId, isLoading, !!session]);

  // ---- DB heartbeat (fallback signal for clients not yet subscribed) ----
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const ping = async () => {
      if (cancelled) return;
      try {
        const { error } = await supabase.rpc('touch_last_seen' as any);
        if (error) throw error;
      } catch {
        await supabase
          .from('profiles')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', userId);
      }
    };

    void ping();
    // Runs regardless of tab visibility: an open background tab still means "on the site".
    const interval = setInterval(ping, HEARTBEAT_MS);
    const onNetOnline = () => void ping();
    window.addEventListener('online', onNetOnline);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener('online', onNetOnline);
    };
  }, [userId]);

  const isOnline = (id: string | null | undefined) => !!id && onlineIds.has(id);

  return (
    <PresenceContext.Provider value={{ onlineIds, isOnline }}>{children}</PresenceContext.Provider>
  );
};

export default PresenceProvider;
