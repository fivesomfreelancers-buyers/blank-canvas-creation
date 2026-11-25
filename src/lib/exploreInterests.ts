// Lightweight on-device interest memory for the Explore menu.
export type InterestKind = 'category' | 'subcategory' | 'tag';
export interface Interest { kind: InterestKind; key: string; label: string; href: string; visits: number; seconds: number; last: number }
const KEY = 'fivesom.exploreInterests.v1';
export const INTEREST_MIN_SECONDS = 10;

export const readInterests = (): Interest[] => {
  try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
};

export const recordInterest = (i: Omit<Interest, 'visits' | 'last' | 'seconds'>, seconds: number): Interest[] => {
  if (seconds < INTEREST_MIN_SECONDS) return readInterests();
  const all = readInterests();
  const found = all.find((x) => x.kind === i.kind && x.key === i.key);
  if (found) { found.visits += 1; found.seconds += Math.round(seconds); found.last = Date.now(); }
  else all.push({ ...i, visits: 1, seconds: Math.round(seconds), last: Date.now() });
  const trimmed = all.sort((a, b) => b.last - a.last).slice(0, 20);
  localStorage.setItem(KEY, JSON.stringify(trimmed));
  return trimmed;
};

export const topInterests = (list: Interest[], n = 4) =>
  [...list].sort((a, b) => b.visits * 60 + b.seconds - (a.visits * 60 + a.seconds) || b.last - a.last).slice(0, n);

export const clearInterests = () => localStorage.removeItem(KEY);
