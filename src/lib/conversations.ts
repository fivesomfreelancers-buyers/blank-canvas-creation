import { supabase } from '@/integrations/supabase/client';

/**
 * Find (or create) the 1:1 conversation between the signed-in user and a partner.
 *
 * Orientation matters for the RLS policies + list queries: the participant who
 * owns a `freelancers` row is stored as `freelancer_id`, everybody else (buyers
 * and neutral members) is stored as `buyer_id`.
 */
export async function getOrCreateConversation(
  currentUserId: string,
  partnerId: string,
): Promise<string | null> {
  if (!currentUserId || !partnerId || currentUserId === partnerId) return null;

  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .or(
      `and(buyer_id.eq.${currentUserId},freelancer_id.eq.${partnerId}),and(buyer_id.eq.${partnerId},freelancer_id.eq.${currentUserId})`,
    )
    .order('created_at', { ascending: true })
    .limit(1);
  if (existing && existing.length > 0) return existing[0].id;

  const { data: freelancerRows } = await supabase
    .from('freelancers')
    .select('user_id')
    .in('user_id', [currentUserId, partnerId]);

  const freelancerIds = new Set((freelancerRows || []).map((f: any) => f.user_id));
  // Prefer the partner as the "freelancer" side when both/neither qualify.
  const freelancerId = freelancerIds.has(partnerId) ? partnerId : currentUserId;
  const buyerId = freelancerId === partnerId ? currentUserId : partnerId;

  const { data: created, error } = await supabase
    .from('conversations')
    .insert({ buyer_id: buyerId, freelancer_id: freelancerId })
    .select('id')
    .single();

  if (error) {
    console.error('getOrCreateConversation failed', error);
    return null;
  }
  return created.id;
}

/** Inbox route that works for every role, including neutral members. */
export const INBOX_PATH = '/inbox';

export function inboxPath(conversationId?: string | null) {
  return conversationId ? `${INBOX_PATH}?c=${encodeURIComponent(conversationId)}` : INBOX_PATH;
}
