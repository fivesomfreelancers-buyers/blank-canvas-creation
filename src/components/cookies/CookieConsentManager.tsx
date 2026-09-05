import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Cookie, X } from 'lucide-react';
import {
  CONSENT_CHANGED_EVENT,
  OPEN_PREFERENCES_EVENT,
  acceptAll,
  getConsent,
  isAllowed,
  rejectNonEssential,
} from '@/lib/cookieConsent';
import CookiePreferencesDialog from './CookiePreferencesDialog';

const ADSENSE_SRC =
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8975138647500349';

/** Loads advertising scripts only after marketing consent is granted. */
function syncMarketingScripts() {
  if (!isAllowed('marketing')) return;
  if (document.querySelector('script[data-consent="marketing-adsense"]')) return;
  const script = document.createElement('script');
  script.src = ADSENSE_SRC;
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.dataset.consent = 'marketing-adsense';
  document.head.appendChild(script);
}

/**
 * Global cookie consent UI: first-visit banner + preferences panel.
 * Mounted once in App so it appears on every route, desktop and mobile.
 */
const CookieConsentManager: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);

  const refresh = useCallback(() => {
    setShowBanner(getConsent() === null);
    syncMarketingScripts();
  }, []);

  useEffect(() => {
    refresh();
    const openPrefs = () => setPrefsOpen(true);
    window.addEventListener(CONSENT_CHANGED_EVENT, refresh);
    window.addEventListener(OPEN_PREFERENCES_EVENT, openPrefs);
    return () => {
      window.removeEventListener(CONSENT_CHANGED_EVENT, refresh);
      window.removeEventListener(OPEN_PREFERENCES_EVENT, openPrefs);
    };
  }, [refresh]);

  return (
    <>
      {showBanner && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
          className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4 pointer-events-none"
        >
          <div className="pointer-events-auto mx-auto w-full max-w-4xl rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-2xl p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Cookie className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Cookie className="h-4 w-4 text-primary sm:hidden" />
                  We use cookies
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                  FIVESOM uses cookies and similar technologies for essential functionality, security,
                  your preferences, analytics and improving your experience. Non-essential cookies stay off
                  until you allow them. See our{' '}
                  <Link to="/legal/cookies" className="text-primary hover:underline">
                    Cookie Policy
                  </Link>{' '}
                  and{' '}
                  <Link to="/legal/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>

                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
                  <Button size="sm" className="w-full sm:w-auto" onClick={() => acceptAll()}>
                    Accept all
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => rejectNonEssential()}
                  >
                    Reject non-essential
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full sm:w-auto text-muted-foreground"
                    onClick={() => setPrefsOpen(true)}
                  >
                    Manage preferences
                  </Button>
                </div>
              </div>
              <button
                type="button"
                aria-label="Reject non-essential cookies and close"
                onClick={() => rejectNonEssential()}
                className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <CookiePreferencesDialog open={prefsOpen} onOpenChange={setPrefsOpen} />
    </>
  );
};

export default CookieConsentManager;
