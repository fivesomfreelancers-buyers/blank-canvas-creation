import { describe, it, expect, beforeEach } from 'vitest';
import { recordInterest, readInterests } from './exploreInterests';
const store = new Map<string, string>();
(globalThis as any).localStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v), removeItem: (k: string) => store.delete(k), clear: () => store.clear() };
const base = { kind: 'category' as const, key: 'logo-design', label: 'Logo Design', href: '/explore?category=logo-design' };
describe('explore interests', () => {
  beforeEach(() => localStorage.clear());
  it('ignores visits shorter than 10 seconds', () => { recordInterest(base, 9); expect(readInterests()).toHaveLength(0); });
  it('counts a visit of 10 seconds or more', () => { recordInterest(base, 10); recordInterest(base, 12); expect(readInterests()[0].visits).toBe(2); });
});
