import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ORDER_FILE_MAX_BYTES, exceedsOrderFileLimit } from '../src/lib/orderUploadLimits';

test('requirements and delivery accept a file of exactly 1GB', () => {
  assert.equal(ORDER_FILE_MAX_BYTES, 1073741824);
  assert.equal(exceedsOrderFileLimit([{ size: 1073741824 }]), false);
  assert.equal(exceedsOrderFileLimit([{ size: 51 * 1024 * 1024 }]), false);
});
test('requirements and delivery reject a file above 1GB', () => {
  assert.equal(exceedsOrderFileLimit([{ size: 1073741825 }]), true);
});
test('the 1GB limit applies per file, not to the combined selection', () => {
  assert.equal(exceedsOrderFileLimit([{ size: 1073741824 }, { size: 1073741824 }]), false);
});