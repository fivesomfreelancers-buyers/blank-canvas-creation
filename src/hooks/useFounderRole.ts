import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const CACHE_PREFIX = 'fivesom.isFounder.';

/**
 * "Is the current user a Fivesom founder?"
 *
 * Source of truth is the server: the `is_founder_user` security-definer
 * function reads `public.user_roles`. Nothing here is hard-coded, and a
 * `true` answer from this hook only unlocks the UI — every founder query and
 * mutation is additionally authorised by RLS on the database side.
 *
 * Reliability rules (so the dashboard never remounts / "refreshes" itself):
 * - The last known answer is cached per user id, so a page refresh or a
 *   return-to-tab token refresh resolves instantly instead of showing the
 *   "Verifying founder access..." screen again.
 * - A background re-check never flips `isLoading` back to true once the answer
 *   is already known, so the dashboard subtree is never unmounted (which used
 *   to wipe the open tab, the selected conversation and unsent drafts).
 * - Only an explicit negative from the server clears a known-true value.
 */
export function useFounderRole() {
  const { user, isLoading: authLoading } = useAuth();
  const cacheKey = user ? `${CACHE_PREFIX}${user.id}` : null;

  const [isFounder, setIsFounder] = useState<boolean | null>(() => {
    try {
      if (!user) return null;
      const cached = localStorage.getItem(`${CACHE_PREFIX}${user.id}`);
      return cached === null ? null : cached === 'true';
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(isFounder === null);
  const inFlight = useRef(false);
  const lastCheckedUser = useRef<string | null>(null);

  const remember = useCallback((id: string, value: boolean) => {
    try { localStorage.setItem(`${CACHE_PREFIX}${id}`, String(value)); } catch { /* ignore */ }
  }, []);

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
          remember(user.id, value);
        }
      } else {
        const value = data === true;
        setIsFounder(value);
        remember(user.id, value);
      }
    } catch {
      if (isFounder === null) setIsFounder(null);
    } finally {
      inFlight.current = false;
      setIsLoading(false);
    }
  }, [user, isFounder, remember]);

  useEffect(() => {
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
    void check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  useEffect(() => {
    if (!cacheKey) return;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached !== null && isFounder === null) setIsFounder(cached === 'true');
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  return {
    isFounder: isFounder === true,
    resolved: isFounder !== null,
    isLoading: (isLoading && isFounder === null) || (authLoading && isFounder === null),
    recheck: check,
  };
}
