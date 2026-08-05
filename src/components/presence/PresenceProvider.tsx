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

const CHANNEL = 'presence:global';
const HEARTBEAT_MS = 45_000;

/**
 * Global presence:
 * - Joins a single Realtime presence channel so every client knows, in real time,
 *   who currently has the site open (works across tabs, survives navigation).
 * - Signed-in users `track()` themselves; anonymous visitors only read the state.
 * - A DB heartbeat keeps `profiles.last_seen` fresh as a fallback for clients that
 *   are not subscribed yet (SSR-less first paint, cached lists, admin views).
 * - Reconnects automatically: Realtime retries the socket, and re-tracks on
 *   SUBSCRIBED, on tab focus, and on `online` network events.
 */
export const PresenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ---- Realtime presence channel ----
  useEffect(() => {
    const channel = supabase.channel(CHANNEL, {
      config: { presence: { key: userId ?? `anon-${Math.random().toString(36).slice(2)}` } },
    });
    channelRef.current = channel;

    const syncState = () => {
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

    const track = () => {
      if (!userId) return;
      channel.track({ user_id: userId, online_at: new Date().toISOString() }).catch(() => {});
    };

    channel
      .on('presence', { event: 'sync' }, syncState)
      .on('presence', { event: 'join' }, syncState)
      .on('presence', { event: 'leave' }, syncState)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') track();
      });

    const onFocus = () => {
      if (document.visibilityState === 'visible') track();
    };
    const onNetOnline = () => track();

    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onNetOnline);

    // Keep the presence meta fresh so a stale socket is replaced rather than dropped.
    const keepAlive = setInterval(track, HEARTBEAT_MS);

    return () => {
      clearInterval(keepAlive);
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onNetOnline);
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [userId]);

  // ---- DB heartbeat (fallback signal) ----
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

    ping();
    // Runs regardless of tab visibility: an open background tab still means "on the site".
    const interval = setInterval(ping, HEARTBEAT_MS);
    const onNetOnline = () => ping();
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
