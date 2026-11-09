import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isIndexableJob } from '../src/lib/seo/publicJobs';
const now = Date.parse('2026-11-09T09:00:00Z');
test('only explicitly published jobs appear publicly', () => {
  for (const status of ['draft', 'pending_approval', 'changes_required', 'rejected']) {
    assert.equal(isIndexableJob({ status, application_deadline: '2026-11-10T09:00:00Z' }, now), false);
  }
  assert.equal(isIndexableJob({ status: 'published', application_deadline: '2026-11-10T09:00:00Z' }, now), true);
});
test('expired or missing application deadlines do not advertise open opportunities', () => {
  assert.equal(isIndexableJob({ status: 'published', application_deadline: '2026-11-09T09:00:00Z' }, now), false);
  assert.equal(isIndexableJob({ status: 'published', application_deadline: null }, now), false);
});