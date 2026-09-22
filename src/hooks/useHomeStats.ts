import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HomeStats {
  activeGigs: number;
  freelancers: number;
  loading: boolean;
}

/**
 * Real counts pulled from the database through a single server-side function so
 * every visitor — signed in or not — sees the same totals (row-level filters
 * used to make the numbers differ per browser). Updates live via realtime.
 */
export const useHomeStats = (): HomeStats => {
  const [stats, setStats] = useState<HomeStats>({ activeGigs: 0, freelancers: 0, loading: true });

  const load = useCallback(async () => {
    const { data, error } = await (supabase as any).rpc('platform_stats');
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row) {
      setStats((s) => ({ ...s, loading: false }));
      return;
    }
    setStats({
      freelancers: Number(row.freelancers ?? 0),
      activeGigs: Number(row.active_gigs ?? 0),
      loading: false,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const refresh = () => {
      if (cancelled) return;
      // small debounce so a burst of changes triggers one refetch
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (!cancelled) void load();
      }, 400);
    };

    void load();

    const channel = supabase
      .channel('home-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'freelancers' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gigs' }, refresh)
      .subscribe();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [load]);

  return stats;
};
