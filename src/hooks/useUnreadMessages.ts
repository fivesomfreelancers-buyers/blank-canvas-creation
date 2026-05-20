import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/** Plays a soft, professional ping using the Web Audio API (no asset needed). */
function playPing() {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    setTimeout(() => ctx.close().catch(() => {}), 600);
  } catch {}
}

function showBrowserNotif(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try { new Notification(title, { body, icon: '/favicon.ico' }); } catch {}
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().catch(() => {});
  }
}

/**
 * Tracks total unread message count for the current user across:
 *  - DM messages (public.messages where receiver = me, is_read = false)
 *  - System messages (system_conversations.unread_user)
 *
 * On new incoming message: plays a soft ping + browser notification if tab unfocused.
 */
export function useUnreadMessages() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const initialized = useRef(false);

  const refresh = async () => {
    if (!user) { setUnreadCount(0); return; }
    const [dm, sys] = await Promise.all([
      supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false),
      (supabase as any)
        .from('system_conversations')
        .select('unread_user')
        .eq('user_id', user.id),
    ]);
    const sysCount = (sys.data || []).reduce(
      (s: number, r: any) => s + (Number(r.unread_user) || 0), 0,
    );
    setUnreadCount((dm.count || 0) + sysCount);
  };

  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    refresh();

    // Ask once for notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    const channel = supabase
      .channel(`unread-rt-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        (payload) => {
          const msg: any = payload.new;
          if (msg.sender_id === user.id) return;
          setUnreadCount((c) => c + 1);
          if (initialized.current) {
            playPing();
            if (document.visibilityState !== 'visible') {
              showBrowserNotif('New message on Fivesom', msg.message?.slice(0, 80) || 'You have a new message');
            }
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        () => { refresh(); },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'system_messages' },
        () => { refresh(); },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'system_conversations', filter: `user_id=eq.${user.id}` },
        () => { refresh(); },
      )
      .subscribe();

    initialized.current = true;
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { unreadCount, refresh };
}
