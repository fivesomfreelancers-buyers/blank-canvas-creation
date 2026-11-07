import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trackBuyerEvent } from '../src/lib/buyerAnalytics';

test('buyer signals require consent and never send identifying context', () => {
  const calls: unknown[][] = [];
  let analytics = false;
  const originals = Object.getOwnPropertyDescriptors(globalThis);
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {
    gtag: (...args: unknown[]) => calls.push(args),
    location: { href: 'https://fivesom.net/payment?session_id=private-session' },
  } });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: () => JSON.stringify({ version: 1, analytics, necessary: true }),
  } });
  try {
    assert.equal(trackBuyerEvent('service_search'), false);
    assert.equal(calls.length, 0);
    analytics = true;
    assert.equal(trackBuyerEvent('begin_checkout'), true);
    assert.deepEqual(calls, [['event', 'begin_checkout', {
      page_location: 'https://fivesom.net/', page_referrer: '',
      page_title: 'FIVESOM buyer journey', event_category: 'buyer_journey',
    }]]);
    (globalThis as unknown as { window: { gtag: () => void } }).window.gtag = () => { throw new Error('Unavailable'); };
    assert.equal(trackBuyerEvent('contact_seller'), false);
  } finally {
    for (const key of ['window', 'localStorage']) {
      const descriptor = originals[key];
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});