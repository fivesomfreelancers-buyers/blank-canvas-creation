import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
export function useJobsData<T>(table: 'jobs' | 'job_applications' | 'job_agreements', column?: string, value?: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    let query = supabase.from(table).select('*').order('created_at', { ascending: false }).limit(1000);
    if (column && value) query = query.eq(column, value);
    const { data, error: err } = await query;
    setError(err?.message || '');
    setRows((data || []) as T[]); setLoading(false);
  }, [table, column, value]);
  useEffect(() => {
    void refresh();
    const channel = supabase.channel(`jobs-${table}-${crypto.randomUUID()}`).on('postgres_changes', { event: '*', schema: 'public', table }, () => void refresh()).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [refresh, table]);
  return { rows, loading, error, refresh };
}