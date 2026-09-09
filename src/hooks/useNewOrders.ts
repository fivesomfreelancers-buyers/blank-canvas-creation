import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/** Soft ping for a new order (Web Audio, no asset). */
function playPing() {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(990, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
    setTimeout(() => ctx.close().catch(() => {}), 700);
  } catch {}
}

const seenKey = (userId: string) => `fivesom:orders-seen:${userId}`;

/**
 * Counts orders received by the current freelancer since they last opened
 * the "Orders Received" section. Updates in realtime on new orders.
 */
export function useNewOrders() {
  const { user } = useAuth();
  const [newOrderCount, setNewOrderCount] = useState(0);
  const freelancerId = useRef<string | null>(null);
  const initialized = useRef(false);

  const refresh = useCallback(async () => {
    if (!user) { setNewOrderCount(0); return; }
    if (!freelancerId.current) {
      const { data } = await supabase
        .from('freelancers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!data?.id) { setNewOrderCount(0); return; }
      freelancerId.current = data.id;
    }
    const since = localStorage.getItem(seenKey(user.id)) || '1970-01-01T00:00:00Z';
    const { count } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('freelancer_id', freelancerId.current)
      .gt('created_at', since);
    setNewOrderCount(count || 0);
  }, [user?.id]);

  const markSeen = useCallback(() => {
    if (!user) return;
    localStorage.setItem(seenKey(user.id), new Date().toISOString());
    setNewOrderCount(0);
  }, [user?.id]);

  useEffect(() => {
    if (!user) { setNewOrderCount(0); return; }
    freelancerId.current = null;
    refresh();

    const channel = supabase
      .channel(`new-orders-rt-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const row: any = payload.new;
        if (!freelancerId.current || row.freelancer_id !== freelancerId.current) return;
        setNewOrderCount((c) => c + 1);
        if (initialized.current) playPing();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => { refresh(); })
      .subscribe();

    initialized.current = true;
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { newOrderCount, refresh, markSeen };
}
