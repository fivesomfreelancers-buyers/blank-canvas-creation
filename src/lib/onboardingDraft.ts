export type OnboardingRole = 'freelancer' | 'buyer';

export interface OnboardingDraft {
  role: OnboardingRole;
  firstName?: string;
  lastName?: string;
  email?: string;
  country?: string;
  professionalTitle?: string;
  category?: string;
  bio?: string;
  industry?: string;
  termsAccepted?: boolean;
}

const KEY = 'fivesom.pendingOnboarding';

export const saveOnboardingDraft = (draft: OnboardingDraft) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // The auth flow still works when storage is unavailable; Google metadata
    // will prefill the identity fields after the provider returns.
  }
};

export const readOnboardingDraft = (): OnboardingDraft | null => {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OnboardingDraft>;
    if (parsed.role !== 'freelancer' && parsed.role !== 'buyer') return null;
    return parsed as OnboardingDraft;
  } catch {
    return null;
  }
};

export const clearOnboardingDraft = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Ignore unavailable browser storage.
  }
};