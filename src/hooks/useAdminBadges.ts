import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AdminBadgeKey =
  | 'orders' | 'chats' | 'disputes' | 'reports' | 'reviews'
  | 'support' | 'withdrawals' | 'verifications' | 'vip'
  | 'fivesom_support';

export type AdminBadges = Record<AdminBadgeKey, number>;

const EMPTY: AdminBadges = {
  orders: 0, chats: 0, disputes: 0, reports: 0, reviews: 0,
  support: 0, withdrawals: 0, verifications: 0, vip: 0, fivesom_support: 0,
};

async function headCount(q: any): Promise<number> {
  const { count } = await q;
  return count || 0;
}

export function useAdminBadges() {
  const [badges, setBadges] = useState<AdminBadges>(EMPTY);

  const refresh = useCallback(async () => {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const sb: any = supabase;
    const [
      orders, disputes, reports, reviews,
      st, bst, fst, withdrawals, verifications, vip, sysconvo,
    ] = await Promise.all([
      headCount(sb.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending')),
      headCount(sb.from('disputes').select('id', { count: 'exact', head: true }).eq('status', 'open')),
      headCount(sb.from('user_reports').select('id', { count: 'exact', head: true }).eq('status', 'open')),
      headCount(sb.from('gig_reviews').select('id', { count: 'exact', head: true }).gte('created_at', since24h)),
      headCount(sb.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open')),
      headCount(sb.from('buyer_support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open')),
      headCount(sb.from('freelancer_support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open')),
      headCount(sb.from('withdrawals').select('id', { count: 'exact', head: true }).eq('status', 'pending')),
      headCount(sb.from('verification_documents').select('id', { count: 'exact', head: true }).eq('status', 'pending')),
      headCount(sb.from('vip_memberships').select('id', { count: 'exact', head: true }).eq('payment_status', 'pending')),
      sb.from('system_conversations').select('unread_admin, type'),
    ]);
    const rows = (sysconvo.data || []) as Array<{ unread_admin: number; type: string }>;
    const chats = rows.reduce((s, r) => s + (Number(r.unread_admin) || 0), 0);
    const fivesomSupportUnread = rows
      .filter(r => r.type === 'support')
      .reduce((s, r) => s + (Number(r.unread_admin) || 0), 0);
    setBadges({
      orders, disputes, reports, reviews,
      support: st + bst + fst,
      withdrawals, verifications, vip,
      chats,
      fivesom_support: fivesomSupportUnread,
    });
  }, []);

  useEffect(() => {
    refresh();
    const tables = [
      'orders', 'disputes', 'user_reports', 'gig_reviews',
      'support_tickets', 'buyer_support_tickets', 'freelancer_support_tickets',
      'withdrawals', 'verification_documents', 'vip_memberships',
      'system_conversations', 'system_messages', 'messages',
    ];
    const channel = supabase.channel('admin-badges');
    tables.forEach((t) =>
      channel.on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: t },
        () => refresh(),
      ),
    );
    channel.subscribe();
    const interval = setInterval(refresh, 30000);
    return () => { supabase.removeChannel(channel); clearInterval(interval); };
  }, [refresh]);

  return { badges, refresh };
}
