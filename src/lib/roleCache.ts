// In-memory cache for the *display* answer to "is this account admin / founder?".
//
// Security model: privilege is decided by Postgres (RLS + security-definer
// functions that re-check the caller's real role). The browser answer only
// decides whether a badge or menu renders while the server answer is in flight.
// It is therefore deliberately NOT persisted: no localStorage / sessionStorage /
// cookie key ever advertises privilege status, and nothing a user edits in
// DevTools can be replayed as authorization.

type Scope = 'admin' | 'founder';

const cache = new Map<string, boolean>();

const keyOf = (scope: Scope, userId: string) => `${scope}:${userId}`;

export const readRoleCache = (scope: Scope, userId: string): boolean | null => {
  const value = cache.get(keyOf(scope, userId));
  return value === undefined ? null : value;
};

export const writeRoleCache = (scope: Scope, userId: string, value: boolean) => {
  cache.set(keyOf(scope, userId), value);
};

export const clearRoleCache = () => cache.clear();

/**
 * Removes the privilege flags earlier builds wrote to browser storage
 * (`fivesom.isAdmin.<uuid>`, `fivesom.isFounder.<uuid>`) plus admin UI state,
 * so existing devices stop exposing them after this update.
 */
export const purgeLegacyRoleCache = () => {
  const stale = (key: string) =>
    key.startsWith('fivesom.isAdmin.') ||
    key.startsWith('fivesom.isFounder.') ||
    key.startsWith('fivesom.admin.') ||
    key === 'fivesom.founder.tab';

  for (const store of [localStorage, sessionStorage]) {
    try {
      Object.keys(store).filter(stale).forEach((k) => store.removeItem(k));
    } catch {
      /* storage unavailable — nothing to purge */
    }
  }
};
