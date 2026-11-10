import type { AccountState } from './accountState';

/** Presentation only; job writes remain authorized by the database RPC. */
export function canShowJobPosting(account: AccountState | null, loading = false): boolean {
  return !loading && Boolean(
    account?.authenticated && account.emailVerified &&
    account.activeRole === 'buyer' && account.selectedRole === 'buyer' &&
    account.onboardingStatus === 'complete'
  );
}