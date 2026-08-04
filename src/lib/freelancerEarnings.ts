import { supabase } from '@/integrations/supabase/client';

/**
 * Columns of `freelancers` that client roles (anon / authenticated) are allowed to read.
 *
 * Financial and payout columns (total_earnings, stripe_account_id, stripe_payouts_enabled,
 * stripe_charges_enabled, stripe_details_submitted, stripe_onboarded_at) are intentionally
 * NOT granted to client roles, so `select('*')` on `freelancers` is rejected by PostgREST.
 * Always use this list instead of `*`.
 */
export const FREELANCER_PUBLIC_COLUMNS = [
  'id',
  'user_id',
  'bio',
  'skills',
  'rating',
  'completed_orders',
  'is_verified',
  'created_at',
  'ranking_score',
  'is_featured',
  'verified_at',
  'years_experience',
  'education_level',
  'software_tools',
  'professional_title',
  'verification_removed_at',
  'verification_removal_reason',
  'verification_removed_by',
  'vip_tier',
  'vip_started_at',
  'vip_expires_at',
  'has_blue_tick',
  'blue_tick_granted_at',
  'blue_tick_removed_at',
  'blue_tick_removed_reason',
].join(', ');

interface EarningsRow {
  id: string;
  user_id: string;
  total_earnings: number | null;
}

/**
 * Total earnings are readable only through the `get_freelancer_earnings` security-definer
 * function, which returns the caller's own freelancer row, plus every row when the caller
 * is an admin. Returns a map of freelancer id -> total earnings.
 */
export async function fetchFreelancerEarnings(ids?: string[]): Promise<Map<string, number>> {
  const { data, error } = await (supabase as any).rpc('get_freelancer_earnings', {
    _ids: ids && ids.length ? ids : null,
  });
  if (error) {
    console.error('get_freelancer_earnings failed', error);
    return new Map();
  }
  return new Map(((data || []) as EarningsRow[]).map((r) => [r.id, Number(r.total_earnings || 0)]));
}

/** Total earnings for a single freelancer (own row, or any row for admins). */
export async function fetchTotalEarnings(freelancerId?: string | null): Promise<number> {
  if (!freelancerId) return 0;
  const map = await fetchFreelancerEarnings([freelancerId]);
  return map.get(freelancerId) ?? 0;
}
