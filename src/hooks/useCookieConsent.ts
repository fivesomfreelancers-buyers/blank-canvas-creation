import { useCallback, useEffect, useState } from 'react';
import {
  CONSENT_CHANGED_EVENT,
  getConsent,
  isAllowed,
  saveConsent,
  type CookieCategory,
  type CookieConsent,
} from '@/lib/cookieConsent';

/** Reactive access to the visitor's cookie consent. */
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(() => getConsent());

  useEffect(() => {
    const sync = () => setConsent(getConsent());
    window.addEventListener(CONSENT_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CONSENT_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const allows = useCallback((category: CookieCategory) => isAllowed(category), [consent]);

  return { consent, decided: consent !== null, allows, save: saveConsent };
}
