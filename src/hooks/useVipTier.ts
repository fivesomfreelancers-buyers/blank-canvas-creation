import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getVipTheme, resolveVipTier, type VipTheme, type VipTier } from '@/lib/vipTheme';

/**
 * Resolve the active VIP tier + theme for a given freelancer.
 * Pass either freelancers.id OR auth user_id.
 */
export function useVipTier(opts: { freelancerId?: string | null; userId?: string | null }): {
  tier: VipTier;
  theme: VipTheme | null;
  loading: boolean;
} {
  const { freelancerId, userId } = opts;
  const [tier, setTier] = useState<VipTier>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!freelancerId && !userId) { setTier(null); setLoading(false); return; }
      setLoading(true);
      const query = supabase.from('freelancers').select('vip_tier, vip_expires_at');
      const { data } = freelancerId
        ? await query.eq('id', freelancerId).maybeSingle()
        : await query.eq('user_id', userId!).maybeSingle();
      if (cancelled) return;
      setTier(resolveVipTier((data as any)?.vip_tier, (data as any)?.vip_expires_at));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [freelancerId, userId]);

  return { tier, theme: getVipTheme(tier), loading };
}
