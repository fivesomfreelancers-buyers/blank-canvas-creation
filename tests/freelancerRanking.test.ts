import { test } from 'node:test';
import assert from 'node:assert/strict';
import { performanceScore, rankFreelancers } from '../src/lib/freelancerRanking';

const gig = (id: string, completedOrders: number, rating: number, reviews: number) =>
  ({ freelancerId: id, freelancer: id, freelancerAvatar: '', freelancerUsername: id, title: 'Logo', completedOrders, rating, reviews } as any);

test('perfect performance scores 100', () => {
  assert.equal(performanceScore(5, 50, 50), 100);
});

test('freelancers without completed orders are excluded', () => {
  const r = rankFreelancers([gig('a', 0, 5, 0), gig('b', 2, 4, 1)]);
  assert.deepEqual(r.map((f) => f.id), ['b']);
});

test('ranking is capped at 10 and ordered by score', () => {
  const gigs = Array.from({ length: 15 }, (_, i) => gig(`f${i}`, i + 1, 5, i + 1));
  const r = rankFreelancers(gigs);
  assert.equal(r.length, 10);
  assert.equal(r[0].id, 'f14');
});
