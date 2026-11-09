import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BUYER_SERVICE_FEE, buyerTotal, freelancerEarnings, serviceFee } from '../src/lib/orderAmounts';

test('a $10 service has the flat $1 buyer fee and totals $11', () => {
  assert.equal(BUYER_SERVICE_FEE, 1);
  assert.equal(buyerTotal({ amount: 10 + BUYER_SERVICE_FEE }), 11);
});
test('the buyer fee is not freelancer earnings', () => {
  const order = { amount: 11, buyer_service_fee: 1 };
  assert.equal(serviceFee(order), 1);
  assert.equal(freelancerEarnings(order), 10);
});