import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PresenceCtx {
  /** User ids currently considered connected to the site. */
  onlineIds: Set<string>;
  isOnline: (userId: string | null | undefined) => boolean;
}

const PresenceContext = createContext<PresenceCtx>({
  onlineIds: new Set(),
  isOnline: () => false,
});

export const usePresenceContext = () => useContext(PresenceContext);

const TOPIC = 'presence:global';
const KEEPALIVE_MS = 20_000;
const DB_HEARTBEAT_MS = 45_000;
/**
 * Sticky window after a presence "leave". Browsers throttle timers in background
 * tabs, which can drop the Realtime socket for a few seconds even though the user
 * never left the site. Peers keep showing Online during this grace period, so the
 * status never flickers. Explicit sign-out / tab close is broadcast and bypasses it.
 */
const LEAVE_GRACE_MS = 60_000;
const OFFLINE_EVENT = 'presence-offline';

/** Timer that keeps firing in throttled/background tabs (Workers aren't throttled). */
const createTicker = (onTick: () => void, intervalMs: number) => {
  try {
    const src = `let i=null;onmessage=e=>{if(e.data&&e.data.start){clearInterval(i);i=setInterval(()=>postMessage('tick'),e.data.start)}else{clearInterval(i)}}`;
    const url = URL.createObjectURL(new Blob([src], { type: 'application/javascript' }));
    const w = new Worker(url);
    w.onmessage = () => onTick();
    w.postMessage({ start: intervalMs });
    return () => {
      w.postMessage({ stop: true });
      w.terminate();
      URL.revokeObjectURL(url);
    };
  } catch {
    const id = setInterval(onTick, intervalMs);
    return () => clearInterval(id);
  }
};

/**
 * Global presence system.
 * - One Realtime presence channel: every client knows in real time who has the site open.
 * - Subscribes only after auth resolved, with the JWT already on the socket, so the
 *   channel is never re-joined with a new token (that duplicate join was closing the
 *   channel and causing random Online/Offline switching).
 * - Self-healing: CLOSED / CHANNEL_ERROR / TIMED_OUT, focus, visibility and network
 *   `online` events trigger a backoff rejoin; a Worker ticker keeps this running in
 *   background/minimized tabs.
 * - Sticky grace prevents flicker; explicit sign-out and tab close broadcast an
 *   immediate offline signal.
 * - `profiles.last_seen` heartbeat remains as a fallback for clients that have not
 *   joined the channel yet.
 */
export const PresenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const userId = user?.id ?? null;
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const anonKeyRef = useRef(`anon-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (isLoading) return; // wait until we know whether there is a session

    let disposed = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let rejoinTimer: ReturnType<typeof setTimeout> | null = null;
    let attempt = 0;

    const presenceKey = userId ?? anonKeyRef.current;
    /** id -> timestamp when it disappeared from presence state (grace tracking). */
    const leftAt = new Map<string, number>();
    const signedOff = new Set<string>();

    const publish = () => {
      const now = Date.now();
      const ids = new Set<string>();
      if (channel) {
        const state = channel.presenceState<{ user_id?: string }>();
        Object.entries(state).forEach(([key, metas]) => {
          (metas as Array<{ user_id?: string }>).forEach((m) => {
            const id = m.user_id || key;
            if (id && !id.startsWith('anon-')) ids.add(id);
          });
        });
      }
      ids.forEach((id) => {
        leftAt.delete(id);
        signedOff.delete(id);
      });
      // Keep recently-dropped users Online for the grace window.
      leftAt.forEach((ts, id) => {
        if (signedOff.has(id)) return;
        if (now - ts <= LEAVE_GRACE_MS) ids.add(id);
        else leftAt.delete(id);
      });
      // Our own session is authoritative for ourselves while we are mounted.
      if (userId) ids.add(userId);
      setOnlineIds((prev) => {
        if (prev.size === ids.size && [...ids].every((i) => prev.has(i))) return prev;
        return ids;
      });
    };

    const onLeave = (payload: any) => {
      const now = Date.now();
      Object.entries(payload?.leftPresences ? { x: payload.leftPresences } : payload?.leaves || {}).forEach(
        ([key, metas]: [string, any]) => {
          (Array.isArray(metas) ? metas : metas?.metas || []).forEach((m: any) => {
            const id = m?.user_id || key;
            if (id && !id.startsWith('anon-')) leftAt.set(id, now);
          });
        }
      );
      // Fallback: anything that vanished from state gets a grace timestamp.
      if (channel) {
        const present = new Set<string>();
        const state = channel.presenceState<{ user_id?: string }>();
        Object.entries(state).forEach(([key, metas]) =>
          (metas as Array<{ user_id?: string }>).forEach((m) => present.add(m.user_id || key))
        );
        onlineIds.forEach((id) => {
          if (!present.has(id) && !leftAt.has(id)) leftAt.set(id, now);
        });
      }
      publish();
    };

    const track = async () => {
      if (!userId || !channel || channel.state !== 'joined') return;
      try {
        await channel.track({ user_id: userId, online_at: new Date().toISOString() });
      } catch {
        /* rejoin logic recovers */
      }
    };

    const scheduleRejoin = () => {
      if (disposed || rejoinTimer) return;
      const delay = Math.min(1000 * 2 ** attempt, 10_000);
      attempt += 1;
      rejoinTimer = setTimeout(() => {
        rejoinTimer = null;
        void join();
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

      // Put the current JWT on the socket *before* joining the topic.
      try {
        await (supabase.realtime as any).setAuth?.();
      } catch {
        /* anon key is used when there is no session */
      }
      if (disposed) return;

      const ch = supabase.channel(TOPIC, { config: { presence: { key: presenceKey } } });
      channel = ch;

      ch.on('presence', { event: 'sync' }, publish)
        .on('presence', { event: 'join' }, publish)
        .on('presence', { event: 'leave' }, onLeave)
        .on('broadcast', { event: OFFLINE_EVENT }, ({ payload }: any) => {
          const id = payload?.user_id;
          if (!id) return;
          signedOff.add(id);
          leftAt.delete(id);
          setOnlineIds((prev) => {
            if (!prev.has(id)) return prev;
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        })
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
      publish(); // prune expired grace entries
    };

    const announceOffline = () => {
      if (!userId || !channel) return;
      try {
        void channel.send({ type: 'broadcast', event: OFFLINE_EVENT, payload: { user_id: userId } });
      } catch {
        /* best effort */
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') ensureAlive();
    };
    const onPageHide = () => announceOffline();

    void join();

    const stopTicker = createTicker(ensureAlive, KEEPALIVE_MS);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', ensureAlive);
    window.addEventListener('online', ensureAlive);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('beforeunload', onPageHide);

    return () => {
      disposed = true;
      stopTicker();
      if (rejoinTimer) clearTimeout(rejoinTimer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', ensureAlive);
      window.removeEventListener('online', ensureAlive);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('beforeunload', onPageHide);
      announceOffline(); // logout / identity change => peers drop us instantly
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
  }, [userId, isLoading]);

  // ---- DB heartbeat (fallback signal for clients not subscribed yet) ----
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
    // Worker ticker: keeps running even when the tab is in the background.
    const stop = createTicker(() => void ping(), DB_HEARTBEAT_MS);
    const onNetOnline = () => void ping();
    window.addEventListener('online', onNetOnline);

    return () => {
      cancelled = true;
      stop();
      window.removeEventListener('online', onNetOnline);
    };
  }, [userId]);

  const isOnline = (id: string | null | undefined) => !!id && onlineIds.has(id);

  return (
    <PresenceContext.Provider value={{ onlineIds, isOnline }}>{children}</PresenceContext.Provider>
  );
};

export default PresenceProvider;
