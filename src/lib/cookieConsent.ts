/**
 * Cookie consent store.
 *
 * Consent is kept in localStorage (primary) and mirrored into a first-party
 * cookie so it survives across subdomains and is readable before React mounts.
 * Nothing non-essential may run until `consent.analytics` / `consent.marketing`
 * is explicitly true.
 */

export type CookieCategory = 'necessary' | 'functional' | 'analytics' | 'marketing';

export interface CookieConsent {
  version: number;
  necessary: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  /** ISO timestamp of the decision */
  decidedAt: string;
}

export const CONSENT_VERSION = 1;
const STORAGE_KEY = 'fivesom.cookie-consent';
const COOKIE_NAME = 'fivesom_cookie_consent';
const ONE_YEAR = 60 * 60 * 24 * 365;

export const CONSENT_CHANGED_EVENT = 'fivesom:cookie-consent-changed';
export const OPEN_PREFERENCES_EVENT = 'fivesom:open-cookie-preferences';

const REJECT_ALL: Omit<CookieConsent, 'decidedAt'> = {
  version: CONSENT_VERSION,
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
};

const ACCEPT_ALL: Omit<CookieConsent, 'decidedAt'> = {
  version: CONSENT_VERSION,
  necessary: true,
  functional: true,
  analytics: true,
  marketing: true,
};

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === 'undefined') return;
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${ONE_YEAR}; SameSite=Lax${secure}`;
}

function parse(raw: string | null): CookieConsent | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (!parsed || parsed.version !== CONSENT_VERSION) return null;
    return {
      version: CONSENT_VERSION,
      necessary: true,
      functional: !!parsed.functional,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
      decidedAt: typeof parsed.decidedAt === 'string' ? parsed.decidedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/** Current stored consent, or null when the visitor has not decided yet. */
export function getConsent(): CookieConsent | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    /* storage blocked — fall back to the cookie */
  }
  return parse(raw) ?? parse(readCookie(COOKIE_NAME));
}

export function hasDecided(): boolean {
  return getConsent() !== null;
}

/** True only when the given category is allowed to run right now. */
export function isAllowed(category: CookieCategory): boolean {
  if (category === 'necessary') return true;
  const consent = getConsent();
  return !!consent && consent[category] === true;
}

export function saveConsent(choice: Partial<Record<Exclude<CookieCategory, 'necessary'>, boolean>>): CookieConsent {
  const consent: CookieConsent = {
    ...REJECT_ALL,
    functional: !!choice.functional,
    analytics: !!choice.analytics,
    marketing: !!choice.marketing,
    decidedAt: new Date().toISOString(),
  };
  const raw = JSON.stringify(consent);
  try {
    localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    /* ignore */
  }
  writeCookie(COOKIE_NAME, raw);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<CookieConsent>(CONSENT_CHANGED_EVENT, { detail: consent }));
  }
  return consent;
}

export function acceptAll() {
  return saveConsent({ functional: true, analytics: true, marketing: true });
}

export function rejectNonEssential() {
  return saveConsent({ functional: false, analytics: false, marketing: false });
}

export const DEFAULT_CHOICES = { accepted: ACCEPT_ALL, rejected: REJECT_ALL };

/** Opens the preferences panel from anywhere (footer link, privacy page…). */
export function openCookiePreferences() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT));
}

export const COOKIE_CATEGORIES: {
  key: CookieCategory;
  title: string;
  description: string;
  locked?: boolean;
}[] = [
  {
    key: 'necessary',
    title: 'Necessary cookies',
    description:
      'Required for the site to work: signing in, keeping your session, security and fraud prevention, payments and escrow. These cannot be switched off.',
    locked: true,
  },
  {
    key: 'functional',
    title: 'Preference cookies',
    description:
      'Remember choices such as theme, language and layout so the site feels the same each time you return.',
  },
  {
    key: 'analytics',
    title: 'Analytics cookies',
    description:
      'Help us understand which pages and services are used, so we can improve FIVESOM. Aggregated and never used to identify you.',
  },
  {
    key: 'marketing',
    title: 'Marketing cookies',
    description:
      'Used by advertising partners (for example Google AdSense) to measure and personalise ads. Off unless you allow them.',
  },
];
