import { isAllowed } from './cookieConsent';

const MEASUREMENT_ID = 'G-50XM7Y4Y4X';
type TrackingWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  [key: `ga-disable-${string}`]: boolean;
};

/** Load non-essential providers only after the visitor's explicit choice. */
export function syncConsentedTracking() {
  const tracking = window as unknown as TrackingWindow;
  const analytics = isAllowed('analytics');
  tracking[`ga-disable-${MEASUREMENT_ID}`] = !analytics;
  if (analytics && !document.getElementById('fivesom-analytics')) {
    tracking.dataLayer = tracking.dataLayer || [];
    tracking.gtag = function (..._args: unknown[]) {
      tracking.dataLayer?.push(arguments);
    };
    tracking.gtag('js', new Date());
    tracking.gtag('config', MEASUREMENT_ID, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: 'https://fivesom.net/',
      page_referrer: '',
    });
    const script = document.createElement('script');
    script.id = 'fivesom-analytics';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }
  if (isAllowed('marketing') && !document.getElementById('fivesom-marketing')) {
    const script = document.createElement('script');
    script.id = 'fivesom-marketing';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8975138647500349';
    document.head.appendChild(script);
  }
}