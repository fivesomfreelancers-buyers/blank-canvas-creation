import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BlueTickEligibility {
  user_id: string;
  freelancer_id: string;
  identity_verified: boolean;
  member_days: number;
  recent_activity: boolean;
  last_seen: string | null;
  completed_orders: number;
  earnings: number;
  rating: number;
  review_count: number;
  active_warnings: number;
  requirements_complete: number;
  requirements_total: number;
  eligible: boolean;
  has_blue_tick: boolean;
  calculated_at: string;
}

export interface BlueTickApplication {
  id: string;
  status: 'draft' | 'pending' | 'more_info_requested' | 'approved' | 'rejected';
  experience: string | null;
  specialties: string[] | null;
  project_summary: string | null;
  social_links: Record<string, string> | null;
  liveness_status: 'not_started' | 'pending' | 'verified' | 'failed';
  persona_inquiry_id: string | null;
  rejection_reason: string | null;
  more_info_request: string | null;
  admin_notes: string | null;
  submitted_at: string | null;
  created_at: string;
}

export const BLUE_TICK_TARGETS = {
  memberDays: 40,
  completedOrders: 10,
  earnings: 50,
  rating: 4.5,
  maxWarnings: 3,
};

/**
 * Server-calculated Blue Tick eligibility (get_blue_tick_eligibility) plus the
 * freelancer's latest application, kept live through realtime subscriptions.
 * All values come from trusted database data — never from the client.
 */
export function useBlueTickEligibility(userId?: string | null) {
  const [eligibility, setEligibility] = useState<BlueTickEligibility | null>(null);
  const [application, setApplication] = useState<BlueTickApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const [{ data, error: rpcError }, { data: app }] = await Promise.all([
      (supabase as any).rpc('get_blue_tick_eligibility', { _user_id: userId }),
      (supabase as any)
        .from('blue_tick_applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    if (rpcError) setError(rpcError.message);
    else {
      setError(null);
      setEligibility(data as BlueTickEligibility);
    }
    setApplication((app as BlueTickApplication) ?? null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    refresh();

    const channel = supabase
      .channel(`blue-tick-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blue_tick_applications', filter: `user_id=eq.${userId}` }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_warnings', filter: `user_id=eq.${userId}` }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'freelancers', filter: `user_id=eq.${userId}` }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'verification_documents', filter: `user_id=eq.${userId}` }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gig_reviews' }, refresh)
      .subscribe();

    // Account-age / activity boundaries move with the clock, so re-check gently.
    timer.current = window.setInterval(refresh, 5 * 60 * 1000);

    return () => {
      supabase.removeChannel(channel);
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [userId, refresh]);

  return { eligibility, application, loading, error, refresh };
}
