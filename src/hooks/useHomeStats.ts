import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HomeStats {
  activeGigs: number;
  freelancers: number;
  loading: boolean;
}

/**
 * Real counts pulled from the database so the homepage never shows invented
 * numbers. Anything that can't be read simply stays at 0 and is hidden by the UI.
 */
export const useHomeStats = (): HomeStats => {
  const [stats, setStats] = useState<HomeStats>({ activeGigs: 0, freelancers: 0, loading: true });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [gigs, freelancers] = await Promise.all([
        supabase.from('gigs').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        (supabase as any).from('public_freelancers').select('id', { count: 'exact', head: true }),
      ]);
      if (cancelled) return;
      setStats({
        activeGigs: gigs.count ?? 0,
        freelancers: freelancers.count ?? 0,
        loading: false,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
};
