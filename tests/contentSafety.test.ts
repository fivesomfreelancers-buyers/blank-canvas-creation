import { describe, it, expect } from 'vitest';
import { hasSuspicious, splitSuspicious } from '../src/lib/contentSafety';
describe('contact highlighting', () => {
  it('flags the Telegram recruiter example', () => {
    const bad = splitSuspicious('contact our Hiring Manager via Telegram at @Ricardo_Emily').filter(p => p.bad).map(p => p.text);
    expect(bad).toContain('@Ricardo_Emily');
  });
  it('flags phone numbers and emails', () => {
    expect(hasSuspicious('call +252 61 555 1234')).toBe(true);
    expect(hasSuspicious('ali@gmail.com')).toBe(true);
  });
  it('does not flag prices or portfolio links', () => {
    expect(hasSuspicious('Budget $1,000 in 10 days, see https://behance.net/ali')).toBe(false);
  });
});
