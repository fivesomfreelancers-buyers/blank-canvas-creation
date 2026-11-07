import { isAllowed } from './cookieConsent';

export type BuyerEvent = 'service_search' | 'gig_view' | 'contact_seller' | 'begin_checkout' | 'checkout_created' | 'purchase_confirmed';

/** Funnel signals only: no search text, profile/order IDs or payment details. */
export function trackBuyerEvent(event: BuyerEvent): boolean {
  if (typeof window === 'undefined' || !isAllowed('analytics')) return false;
  const analyticsWindow = window as Window & { gtag?: (...args: unknown[]) => void };
  if (!analyticsWindow.gtag) return false;
  // Explicitly replace automatic URL context: checkout URLs contain session IDs.
  try {
    analyticsWindow.gtag('event', event, {
      page_location: 'https://fivesom.net/',
      page_referrer: '',
      page_title: 'FIVESOM buyer journey',
      event_category: 'buyer_journey',
    });
    return true;
  } catch {
    // Measurement must never prevent contacting a seller or placing an order.
    return false;
  }
}