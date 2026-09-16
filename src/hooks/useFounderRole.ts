import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { purgeLegacyRoleCache, readRoleCache, writeRoleCache } from '@/lib/roleCache';

/**
 * "Is the current user a Fivesom founder?"
 *
 * Source of truth is the server: the `is_founder_user` security-definer
 * function reads `public.user_roles`. Nothing here is hard-coded, and a
 * `true` answer from this hook only unlocks the UI — every founder query and
 * mutation is additionally authorised by RLS on the database side.
 *
 * The answer is cached in memory for the tab's lifetime only. It is never
 * written to localStorage, so browser storage never exposes (or accepts) a
 * privilege flag.
 */
export function useFounderRole() {
  const { user, isLoading: authLoading } = useAuth();

  const [isFounder, setIsFounder] = useState<boolean | null>(() =>
    user ? readRoleCache('founder', user.id) : null
  );
  const [isLoading, setIsLoading] = useState(isFounder === null);
  const inFlight = useRef(false);
  const lastCheckedUser = useRef<string | null>(null);

  const check = useCallback(async () => {
    if (inFlight.current) return;
    if (!user) {
      setIsFounder(null);
      setIsLoading(false);
      return;
    }
    inFlight.current = true;
    // Only block the UI when we have nothing to show yet.
    setIsLoading((prev) => (isFounder === null ? true : prev));
    try {
      const { data, error } = await (supabase as any).rpc('is_founder_user', { _user_id: user.id });
      if (error) {
        // Fallback: direct read (RLS still restricts this to the caller's own rows).
        const { data: rows, error: tableErr } = await (supabase as any)
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        if (tableErr) {
          // Unknown → keep whatever we already know, retry on next mount.
          if (isFounder === null) setIsFounder(null);
        } else {
          const value = (rows || []).some((r: any) => r.role === 'founder');
          setIsFounder(value);
          writeRoleCache('founder', user.id, value);
        }
      } else {
        const value = data === true;
        setIsFounder(value);
        writeRoleCache('founder', user.id, value);
      }
    } catch {
      if (isFounder === null) setIsFounder(null);
    } finally {
      inFlight.current = false;
      setIsLoading(false);
    }
  }, [user, isFounder]);

  useEffect(() => {
    purgeLegacyRoleCache();
    if (authLoading) return;
    if (!user) {
      lastCheckedUser.current = null;
      setIsFounder(null);
      setIsLoading(false);
      return;
    }
    // Re-check only when the identity actually changes — token refreshes must
    // not restart the guard.
    if (lastCheckedUser.current === user.id) return;
    lastCheckedUser.current = user.id;
    const cached = readRoleCache('founder', user.id);
    if (cached !== null && isFounder === null) setIsFounder(cached);
    void check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  return {
    isFounder: isFounder === true,
    resolved: isFounder !== null,
    isLoading: (isLoading && isFounder === null) || (authLoading && isFounder === null),
    recheck: check,
  };
}
