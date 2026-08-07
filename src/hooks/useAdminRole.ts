import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const CACHE_PREFIX = 'fivesom.isAdmin.';

/**
 * Single source of truth for "is the current user an admin?".
 *
 * Reliability rules:
 * - Resolves through the `has_role` security-definer RPC (admin + super_admin),
 *   with a direct `user_roles` read as a fallback so a single failing path can
 *   never make the badge disappear.
 * - Retries transient failures instead of returning `false` (that false was the
 *   root cause of the badge flickering away on refresh / token refresh).
 * - Caches the last known answer per user id so a refresh renders the badge
 *   immediately instead of flashing empty while the network call is in flight.
 * - Never clears a known-true value because of an error — only an explicit
 *   negative answer from the server, or a sign-out, does that.
 */
export function useAdminRole() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const inFlight = useRef(false);

  const resolve = useCallback(async (id: string): Promise<boolean | null> => {
    // Preferred path: security-definer RPC.
    for (const role of ['admin', 'super_admin'] as const) {
      const { data, error } = await (supabase as any).rpc('has_role', { _user_id: id, _role: role });
      if (!error && data === true) return true;
      if (error) {
        // RPC unreachable → fall through to the table read before giving up.
        const { data: rows, error: tableErr } = await (supabase as any)
          .from('user_roles')
          .select('role')
          .eq('user_id', id)
          .in('role', ['admin', 'super_admin']);
        if (tableErr) return null; // unknown, retry later
        return Array.isArray(rows) && rows.length > 0;
      }
    }
    return false;
  }, []);

  const check = useCallback(async (attempt = 0) => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserId(null);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      setUserId(user.id);

      const cached = localStorage.getItem(CACHE_PREFIX + user.id);
      if (cached !== null && isAdmin === null) setIsAdmin(cached === 'true');

      const result = await resolve(user.id);
      if (result === null) {
        // Transient failure — keep the previous answer and retry with backoff.
        if (attempt < 4) {
          setTimeout(() => { inFlight.current = false; check(attempt + 1); }, 600 * (attempt + 1));
          return;
        }
        setIsAdmin((prev) => (prev === null ? false : prev));
      } else {
        setIsAdmin(result);
        localStorage.setItem(CACHE_PREFIX + user.id, String(result));
      }
    } finally {
      setIsLoading(false);
      inFlight.current = false;
    }
  }, [isAdmin, resolve]);

  useEffect(() => {
    check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setIsAdmin(false);
        setUserId(null);
        setIsLoading(false);
        return;
      }
      // A token refresh for the same user must not re-trigger a check that can
      // momentarily blank the badge.
      if (event === 'TOKEN_REFRESHED' && session.user.id === userId) return;
      check();
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isAdmin: isAdmin === true, isAdminResolved: isAdmin !== null, isLoading, recheck: () => check() };
}
