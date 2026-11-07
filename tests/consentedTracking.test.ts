import { test } from 'node:test';
import assert from 'node:assert/strict';
import { syncConsentedTracking } from '../src/lib/consentedTracking';

test('optional providers load only with consent and do not auto-send checkout URLs', () => {
  let analytics = false;
  let marketing = false;
  const scripts: { id: string }[] = [];
  const originals = Object.getOwnPropertyDescriptors(globalThis);
  const tracking: { dataLayer?: IArguments[]; [key: string]: unknown } = {};
  Object.defineProperty(globalThis, 'window', { configurable: true, value: tracking });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: () => JSON.stringify({ version: 1, analytics, marketing }),
  } });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: {
    getElementById: (id: string) => scripts.find(script => script.id === id),
    createElement: () => ({}),
    head: { appendChild: (script: { id: string }) => scripts.push(script) },
  } });
  try {
    syncConsentedTracking();
    assert.equal(scripts.length, 0);
    analytics = true;
    syncConsentedTracking();
    assert.deepEqual(scripts.map(script => script.id), ['fivesom-analytics']);
    assert.equal(tracking.dataLayer?.[1][2].send_page_view, false);
    assert.equal(tracking.dataLayer?.[1][2].page_location, 'https://fivesom.net/');
    syncConsentedTracking();
    assert.equal(scripts.length, 1);
    marketing = true;
    syncConsentedTracking();
    assert.equal(scripts[1].id, 'fivesom-marketing');
    analytics = false;
    syncConsentedTracking();
    assert.equal(tracking['ga-disable-G-50XM7Y4Y4X'], true);
  } finally {
    for (const key of ['window', 'localStorage', 'document']) {
      const descriptor = originals[key];
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});