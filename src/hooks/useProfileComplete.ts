import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type ProfileCompleteState = 'loading' | 'complete' | 'incomplete';

const hasText = (v: unknown) => typeof v === 'string' && v.trim().length > 0;

/**
 * A freelancer/buyer account is only allowed into its dashboard once the
 * mandatory profile fields are actually filled in. Accounts that slipped
 * through the old "Skip for now" shortcut are caught here.
 */
export const useProfileComplete = (role: 'freelancer' | 'buyer' | null) => {
  const { user } = useAuth();
  const [state, setState] = useState<ProfileCompleteState>('loading');

  useEffect(() => {
    let cancelled = false;

    if (!user || !role) {
      setState('loading');
      return;
    }

    (async () => {
      try {
        const { data } = await (supabase as any)
          .from('profiles')
          .select('full_name, location, professional_title, bio, industry')
          .eq('id', user.id)
          .maybeSingle();

        if (cancelled) return;

        if (!data) {
          setState('incomplete');
          return;
        }

        const base = hasText(data.full_name) && hasText(data.location);
        const complete =
          role === 'freelancer'
            ? base && hasText(data.professional_title) && hasText(data.bio)
            : base && hasText(data.industry);

        setState(complete ? 'complete' : 'incomplete');
      } catch {
        // Never lock someone out because of a network hiccup.
        if (!cancelled) setState('complete');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, role]);

  return state;
};
