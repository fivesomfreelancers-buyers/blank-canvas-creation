import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchAccountState, type AccountState } from '@/lib/accountState';

/**
 * Loads the authoritative onboarding state of the signed-in account from the
 * database. `null` while it is still loading.
 */
export const useAccountState = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<AccountState | null>(null);
  const [error, setError] = useState<unknown>(null);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setError(null);
    if (!user) {
      setState(null);
      return;
    }
    try {
      const next = await fetchAccountState();
      if (currentRequest !== requestId.current) return;
      setState(next);
      setError(null);
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      setError(err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;
    setState(null);
    void load();
    return () => { requestId.current += 1; };
  }, [authLoading, user?.id, load]);

  return { state, error, isLoading: authLoading || (Boolean(user) && state === null && !error), refresh: load };
};
