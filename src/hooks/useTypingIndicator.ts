import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * WhatsApp-style typing indicator.
 *
 * Uses a Supabase Realtime broadcast channel scoped to the conversation, so no
 * database writes are needed. The sender emits a lightweight `typing` event at
 * most every 1.5s while composing; the receiver clears the indicator after 3s
 * of silence (or immediately on a `stop` event / new message).
 */
export function useTypingIndicator(
  conversationId: string | null,
  currentUserId: string | null,
  enabled = true,
) {
  const [partnerTyping, setPartnerTyping] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastSentRef = useRef(0);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPartnerTyping(false);
    if (!conversationId || !currentUserId || !enabled) {
      channelRef.current = null;
      return;
    }

    const channel = supabase.channel(`typing:${conversationId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }: any) => {
        if (payload?.userId === currentUserId) return;
        setPartnerTyping(true);
        if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
        clearTimerRef.current = setTimeout(() => setPartnerTyping(false), 3000);
      })
      .on('broadcast', { event: 'stop' }, ({ payload }: any) => {
        if (payload?.userId === currentUserId) return;
        if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
        setPartnerTyping(false);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, enabled]);

  /** Call on every keystroke — throttled internally. */
  const notifyTyping = useCallback(() => {
    const ch = channelRef.current;
    if (!ch || !currentUserId) return;
    const now = Date.now();
    if (now - lastSentRef.current < 1500) return;
    lastSentRef.current = now;
    ch.send({ type: 'broadcast', event: 'typing', payload: { userId: currentUserId } });
  }, [currentUserId]);

  /** Call after sending / clearing the composer. */
  const notifyStopTyping = useCallback(() => {
    const ch = channelRef.current;
    if (!ch || !currentUserId) return;
    lastSentRef.current = 0;
    ch.send({ type: 'broadcast', event: 'stop', payload: { userId: currentUserId } });
  }, [currentUserId]);

  return { partnerTyping, notifyTyping, notifyStopTyping };
}
