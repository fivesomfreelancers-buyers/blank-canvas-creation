import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * "Is the current user a Fivesom founder?"
 *
 * Source of truth is the server: the `is_founder_user` security-definer
 * function reads `public.user_roles`. Nothing here is hard-coded, and a
 * `true` answer from this hook only unlocks the UI — every founder query and
 * mutation is additionally authorised by RLS on the database side.
 */
export function useFounderRole() {
  const { user, isLoading: authLoading } = useAuth();
  const [isFounder, setIsFounder] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const inFlight = useRef(false);

  const check = useCallback(async () => {
    if (inFlight.current) return;
    if (!user) {
      setIsFounder(null);
      setIsLoading(false);
      return;
    }
    inFlight.current = true;
    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any).rpc('is_founder_user', { _user_id: user.id });
      if (error) {
        // Fallback: direct read (RLS still restricts this to the caller's own rows).
        const { data: rows, error: tableErr } = await (supabase as any)
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        if (tableErr) {
          setIsFounder(null);
        } else {
          setIsFounder((rows || []).some((r: any) => r.role === 'founder'));
        }
      } else {
        setIsFounder(data === true);
      }
    } catch {
      setIsFounder(null);
    } finally {
      inFlight.current = false;
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void check();
  }, [authLoading, check]);

  return { isFounder: isFounder === true, resolved: isFounder !== null, isLoading: isLoading || authLoading, recheck: check };
}
