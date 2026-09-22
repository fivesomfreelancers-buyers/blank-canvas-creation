import { supabase } from '@/integrations/supabase/client';
import type { OnboardingRole } from '@/lib/onboardingDraft';

const toOnboardingRole = (value: unknown): OnboardingRole | null => {
  return value === 'buyer' || value === 'freelancer' ? value : null;
};

export const getSavedOnboardingRole = async (userId: string): Promise<OnboardingRole | null> => {
  const { data, error } = await (supabase as any)
    .from('profiles')
    .select('onboarding_role')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return toOnboardingRole(data?.onboarding_role);
};

/**
 * Saves the first Buyer/Freelancer choice in Postgres. The database rejects a
 * later attempt to switch it and does not grant the actual platform role.
 */
export const saveOnboardingRole = async (role: OnboardingRole): Promise<OnboardingRole> => {
  const { data, error } = await (supabase as any).rpc('set_onboarding_role', { _role: role });
  if (error) throw new Error(error.message || 'Could not save the selected account type.');
  const saved = toOnboardingRole(typeof data === 'string' ? data : null);
  // An account that already holds another role keeps it; treat that as saved.
  return saved ?? role;
};