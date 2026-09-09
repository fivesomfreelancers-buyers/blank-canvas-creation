import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/** Soft ping for a new delivery (Web Audio, no asset). */
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

const seenKey = (userId: string) => `fivesom:deliveries-seen:${userId}`;

/**
 * Counts deliveries the current buyer received since they last opened
 * their orders section. Updates in realtime when freelancers deliver.
 */
export function useNewDeliveries() {
  const { user } = useAuth();
  const [newDeliveryCount, setNewDeliveryCount] = useState(0);
  const orderIds = useRef<string[]>([]);
  const initialized = useRef(false);

  const refresh = useCallback(async () => {
    if (!user) { setNewDeliveryCount(0); return; }
    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('buyer_id', user.id);
    const ids = (orders || []).map((o: any) => o.id);
    orderIds.current = ids;
    if (!ids.length) { setNewDeliveryCount(0); return; }

    const since = localStorage.getItem(seenKey(user.id)) || '1970-01-01T00:00:00Z';
    const { count } = await supabase
      .from('order_deliveries')
      .select('id', { count: 'exact', head: true })
      .in('order_id', ids)
      .gt('created_at', since);
    setNewDeliveryCount(count || 0);
  }, [user?.id]);

  const markSeen = useCallback(() => {
    if (!user) return;
    localStorage.setItem(seenKey(user.id), new Date().toISOString());
    setNewDeliveryCount(0);
  }, [user?.id]);

  useEffect(() => {
    if (!user) { setNewDeliveryCount(0); return; }
    refresh();

    const channel = supabase
      .channel(`new-deliveries-rt-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_deliveries' }, (payload) => {
        const row: any = payload.new;
        if (!orderIds.current.includes(row.order_id)) { refresh(); return; }
        setNewDeliveryCount((c) => c + 1);
        if (initialized.current) playPing();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => { refresh(); })
      .subscribe();

    initialized.current = true;
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { newDeliveryCount, refresh, markSeen };
}
