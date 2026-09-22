import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { purgeLegacyRoleCache, readRoleCache, writeRoleCache } from '@/lib/roleCache';

/**
 * Single source of truth for "is the current user an admin?".
 *
 * Security model: this hook only controls what the UI *renders*. Authorization
 * is enforced exclusively in Postgres (RLS + security-definer functions that
 * re-check `is_admin_user(auth.uid())`). Because of that, the answer is never
 * persisted to localStorage — it lives in memory for the tab's lifetime only,
 * so nothing in browser storage advertises or can fake privilege status.
 *
 * Reliability rules:
 * - Resolves through the server's `is_admin_user` decision (admin,
 *   super_admin and founder),
 *   with a direct `user_roles` read as a fallback.
 * - Retries transient failures instead of returning `false`.
 * - Never clears a known-true value because of an error — only an explicit
 *   negative answer from the server, or a sign-out, does that.
 */
export function useAdminRole() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const inFlight = useRef(false);

  const resolve = useCallback(async (id: string): Promise<boolean | null> => {
    // This is the same server-side decision used by admin database policies.
    const { data, error } = await (supabase as any).rpc('is_admin_user', { _user_id: id });
    if (!error) return data === true;

    // RPC unreachable → fall through to the caller's RLS-scoped role rows.
    const { data: rows, error: tableErr } = await (supabase as any)
      .from('user_roles')
      .select('role')
      .eq('user_id', id)
      .in('role', ['admin', 'super_admin', 'founder']);
    if (tableErr) return null;
    return Array.isArray(rows) && rows.length > 0;
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

      // In-memory only (never written to disk).
      const cached = readRoleCache('admin', user.id);
      if (cached !== null && isAdmin === null) setIsAdmin(cached);

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
        writeRoleCache('admin', user.id, result);
      }
    } finally {
      setIsLoading(false);
      inFlight.current = false;
    }
  }, [isAdmin, resolve]);

  useEffect(() => {
    purgeLegacyRoleCache();
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
