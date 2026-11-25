import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACADEMY_PLANS, courseLimit } from '../src/lib/academy';

test('Golden is $5/month with $1 first month and 1 course', () => {
  assert.equal(ACADEMY_PLANS.golden.price, 5);
  assert.equal(ACADEMY_PLANS.golden.firstMonth, 1);
  assert.equal(courseLimit('golden'), 1);
});
test('Platinum is $20/month with $10 first month and 3 courses', () => {
  assert.equal(ACADEMY_PLANS.platinum.price, 20);
  assert.equal(ACADEMY_PLANS.platinum.firstMonth, 10);
  assert.equal(courseLimit('platinum'), 3);
});
test('no plan means no courses', () => { assert.equal(courseLimit(null), 0); });
