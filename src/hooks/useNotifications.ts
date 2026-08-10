import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type NotificationKind = 'dm' | 'support' | 'news';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  unread: boolean;
  /** In-app link that opens the related conversation. */
  href: string;
  avatarUrl?: string | null;
}

const RECENT_LIMIT = 12;

/**
 * Aggregated header notifications: direct messages + Fivesom Support +
 * Fivesom News. Kept in sync in realtime so nothing is missed.
 */
export function useNotifications() {
  const { user, userRole } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const inboxBase = userRole === 'freelancer' ? '/freelancer/messages' : '/buyer/messages';
  const inboxRef = useRef(inboxBase);
  inboxRef.current = inboxBase;

  const refresh = useCallback(async () => {
    if (!user) { setItems([]); setLoading(false); return; }

    const [dmRes, sysRes] = await Promise.all([
      supabase
        .from('messages')
        .select('id, message, created_at, is_read, sender_id, conversation_id')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(RECENT_LIMIT),
      (supabase as any)
        .from('system_messages')
        .select('id, body, created_at, is_read_user, sender_type, conversation_id, system_conversations!inner(id, type, user_id)')
        .neq('sender_type', 'user')
        .eq('system_conversations.user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(RECENT_LIMIT),
    ]);

    const dms = (dmRes.data || []) as any[];
    const senderIds = Array.from(new Set(dms.map((m) => m.sender_id)));
    const nameById = new Map<string, { name: string; image: string | null }>();
    if (senderIds.length) {
      const { data: people } = await supabase
        .from('profiles')
        .select('id, full_name, profile_image_url')
        .in('id', senderIds);
      (people || []).forEach((p: any) =>
        nameById.set(p.id, { name: p.full_name || 'Fivesom Member', image: p.profile_image_url || null }),
      );
    }

    const dmItems: AppNotification[] = dms.map((m) => {
      const who = nameById.get(m.sender_id);
      return {
        id: `dm-${m.id}`,
        kind: 'dm',
        title: who?.name || 'New message',
        body: String(m.message ?? '').slice(0, 120),
        createdAt: m.created_at,
        unread: !m.is_read,
        href: m.conversation_id ? `/messages?c=${m.conversation_id}` : inboxRef.current,
        avatarUrl: who?.image ?? null,
      };
    });

    const sysItems: AppNotification[] = ((sysRes.data || []) as any[]).map((m) => {
      const type = m.system_conversations?.type === 'news' ? 'news' : 'support';
      return {
        id: `sys-${m.id}`,
        kind: type as NotificationKind,
        title: type === 'news' ? 'Fivesom News' : 'Fivesom Support',
        body: String(m.body ?? '').slice(0, 120),
        createdAt: m.created_at,
        unread: !m.is_read_user,
        href: `/messages?c=${m.conversation_id}`,
      };
    });

    setItems(
      [...dmItems, ...sysItems]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, RECENT_LIMIT),
    );
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!user) { setItems([]); setLoading(false); return; }
    refresh();

    const channel = supabase
      .channel(`notifications-rt-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_messages' }, () => refresh())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, refresh]);

  const unreadCount = items.filter((i) => i.unread).length;
  return { items, unreadCount, loading, refresh, inboxBase };
}
