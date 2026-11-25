import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
const store = new Map<string, string>();
(globalThis as any).localStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => { store.set(k, v); }, removeItem: (k: string) => { store.delete(k); }, clear: () => store.clear() };
const { recordInterest, readInterests } = await import('../src/lib/exploreInterests');
const base = { kind: 'category' as const, key: 'logo-design', label: 'Logo Design', href: '/explore?category=logo-design' };
describe('explore interests', () => {
  beforeEach(() => store.clear());
  it('ignores visits shorter than 10 seconds', () => { recordInterest(base, 9); assert.equal(readInterests().length, 0); });
  it('counts visits of 10 seconds or more', () => { recordInterest(base, 10); recordInterest(base, 12); assert.equal(readInterests()[0].visits, 2); });
});
