// Client-side brute-force guard for auth screens.
//
// Supabase Auth already throttles sign-in / sign-up / reset requests server-side.
// This adds a visible, escalating cooldown per identifier so a scripted or manual
// password-guessing run is slowed down before it ever reaches the auth API.

type Attempt = { count: number; until: number };

const STORE_KEY = 'fivesom.auth.attempts';
const MAX_ATTEMPTS = 5;

// Cooldown (seconds) applied once MAX_ATTEMPTS is exceeded, escalating.
const COOLDOWNS = [30, 60, 300, 900, 1800];

const load = (): Record<string, Attempt> => {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
  } catch {
    return {};
  }
};

const save = (data: Record<string, Attempt>) => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable — guard simply degrades */
  }
};

const keyFor = (action: string, identifier: string) =>
  `${action}:${identifier.trim().toLowerCase()}`;

/** Seconds the caller must wait, or 0 when the attempt is allowed. */
export const authCooldownRemaining = (action: string, identifier: string): number => {
  const entry = load()[keyFor(action, identifier)];
  if (!entry) return 0;
  const remaining = Math.ceil((entry.until - Date.now()) / 1000);
  return remaining > 0 ? remaining : 0;
};

export const recordAuthFailure = (action: string, identifier: string): number => {
  const data = load();
  const key = keyFor(action, identifier);
  const count = (data[key]?.count ?? 0) + 1;

  let until = 0;
  if (count >= MAX_ATTEMPTS) {
    const step = Math.min(count - MAX_ATTEMPTS, COOLDOWNS.length - 1);
    until = Date.now() + COOLDOWNS[step] * 1000;
  }

  data[key] = { count, until };
  save(data);
  return until ? Math.ceil((until - Date.now()) / 1000) : 0;
};

export const clearAuthFailures = (action: string, identifier: string) => {
  const data = load();
  delete data[keyFor(action, identifier)];
  save(data);
};

export const cooldownMessage = (seconds: number) => {
  if (seconds >= 60) {
    const mins = Math.ceil(seconds / 60);
    return `Too many attempts. Please wait ${mins} minute${mins > 1 ? 's' : ''} and try again.`;
  }
  return `Too many attempts. Please wait ${seconds} seconds and try again.`;
};
