import { supabase } from '@/integrations/supabase/client';
import type { OnboardingRole } from '@/lib/onboardingDraft';

export type OnboardingStatus = 'role_pending' | 'incomplete' | 'complete';

export interface AccountProfile {
  full_name: string | null;
  location: string | null;
  professional_title: string | null;
  bio: string | null;
  industry: string | null;
  profile_image_url: string | null;
  username: string | null;
  email: string | null;
}

export interface AccountState {
  authenticated: boolean;
  emailVerified: boolean;
  activeRole: string | null;
  selectedRole: OnboardingRole | null;
  onboardingStatus: OnboardingStatus;
  profileComplete: boolean;
  profile: AccountProfile;
}

const EMPTY_PROFILE: AccountProfile = {
  full_name: null, location: null, professional_title: null, bio: null,
  industry: null, profile_image_url: null, username: null, email: null,
};

const toRole = (value: unknown): OnboardingRole | null =>
  value === 'buyer' || value === 'freelancer' ? value : null;

/**
 * The database is the single source of truth for: which account type the person
 * picked, whether their identity is confirmed, and whether the required setup
 * form is finished. Nothing here is read from the browser, so the answer is the
 * same on any browser or device.
 */
export const fetchAccountState = async (): Promise<AccountState> => {
  const { data, error } = await (supabase as any).rpc('get_account_state');
  if (error) throw error;
  const raw = (data ?? {}) as Record<string, any>;
  const status = raw.onboarding_status;
  return {
    authenticated: Boolean(raw.authenticated),
    emailVerified: Boolean(raw.email_verified),
    activeRole: typeof raw.active_role === 'string' ? raw.active_role : null,
    selectedRole: toRole(raw.selected_role),
    onboardingStatus:
      status === 'complete' || status === 'incomplete' || status === 'role_pending'
        ? status
        : 'role_pending',
    profileComplete: Boolean(raw.profile_complete),
    profile: { ...EMPTY_PROFILE, ...(raw.profile ?? {}) },
  };
};

/** Where this account belongs right now, decided from database state only. */
export const accountLandingPath = (state: AccountState): string => {
  if (!state.authenticated) return '/login';
  if (!state.emailVerified) return '/verify-email';
  if (state.activeRole && ['admin', 'super_admin', 'founder'].includes(state.activeRole)) return '/admin';
  if (state.onboardingStatus === 'complete' && state.selectedRole) {
    return state.selectedRole === 'freelancer' ? '/freelancer/dashboard' : '/buyer/dashboard';
  }
  if (state.selectedRole) return `/register/${state.selectedRole}`;
  return '/select-role';
};
