import { supabase } from '@/integrations/supabase/client';
import { clearOnboardingDraft } from '@/lib/onboardingDraft';

/**
 * A Google account that starts role onboarding but never finishes it must not
 * count as a registered buyer/freelancer. When such a user leaves the page, we
 * record the abandonment synchronously (pagehide cannot await async work) and
 * the next time the app loads we sign the account out so the person has to
 * start the sign-up flow again from the beginning.
 */
const KEY = 'fivesom.abandonedOnboarding';

export const markOnboardingAbandoned = (userId: string) => {
  try {
    localStorage.setItem(KEY, userId);
  } catch {
    // Storage unavailable — onboarding simply stays resumable.
  }
  clearOnboardingDraft();
};

export const clearOnboardingAbandoned = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Ignore unavailable browser storage.
  }
};

/**
 * Returns true when the incomplete account was signed out and must restart.
 */
export const enforceAbandonedOnboarding = async (userId: string) => {
  let flagged = false;
  try {
    flagged = localStorage.getItem(KEY) === userId;
  } catch {
    return false;
  }
  if (!flagged) return false;
  clearOnboardingAbandoned();
  clearOnboardingDraft();
  try {
    await supabase.auth.signOut();
  } catch {
    // Even if the network call fails the local session is dropped.
  }
  return true;
};
