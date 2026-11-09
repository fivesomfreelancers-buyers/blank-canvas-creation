import { isAllowed, CONSENT_CHANGED_EVENT } from './cookieConsent';

const GA_ID = 'G-50XM7Y4Y4X';
export function startAnalyticsRuntime() {
  let initialized = false;
  const sync = () => {
    const runtime = window as Window & {
      dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void;
    };
    const allowed = isAllowed('analytics');
    (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = !allowed;
    if (!allowed) return;
    runtime.dataLayer ??= [];
    runtime.gtag ??= function (..._args: unknown[]) { runtime.dataLayer?.push(arguments); };
    if (!initialized) {
      runtime.gtag('js', new Date());
      runtime.gtag('config', GA_ID, { send_page_view: false });
      if (!document.getElementById('fivesom-analytics')) {
        const script = document.createElement('script');
        script.id = 'fivesom-analytics'; script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        document.head.appendChild(script);
      }
      initialized = true;
    }
  };
  sync();
  window.addEventListener(CONSENT_CHANGED_EVENT, sync);
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, sync);
}