/**
 * Remembers whether the person started a "sign in" or a "sign up" before being
 * sent to Google. Only used to refuse brand-new accounts that arrive through the
 * login page — the database still decides every permission.
 */
export type AuthIntent = 'login' | 'signup';

const KEY = 'fivesom.authIntent';

export const setAuthIntent = (intent: AuthIntent) => {
  try {
    sessionStorage.setItem(KEY, intent);
  } catch {
    // Storage unavailable: the flow still works, we simply cannot refuse early.
  }
};

/** Reads the stored intent and clears it so it is used only once. */
export const takeAuthIntent = (): AuthIntent | null => {
  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return raw === 'login' || raw === 'signup' ? raw : null;
  } catch {
    return null;
  }
};
