import { test } from 'node:test';
import assert from 'node:assert/strict';
import { submitSavedGigForReview } from '../src/lib/gigSubmission';

function clientFor(reviewStatus = 'pending_review', status = 'draft', deadline = '2026-10-17T20:00:00.000Z') {
  const calls: Array<{ name: string; args: { _gig_id: string } }> = [];
  return {
    calls,
    rpc: async (name: 'submit_gig_for_review', args: { _gig_id: string }) => {
      calls.push({ name, args });
      return { error: null };
    },
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({
      data: { review_status: reviewStatus, status, submitted_at: '2026-10-17T15:00:00.000Z', review_deadline: deadline }, error: null,
    }) }) }) }),
  };
}

test('a corrected existing gig is resubmitted through the server review transition', async () => {
  const client = clientFor();
  const saved = await submitSavedGigForReview(client, 'existing-corrected-gig');
  assert.deepEqual(client.calls, [{ name: 'submit_gig_for_review', args: { _gig_id: 'existing-corrected-gig' } }]);
  assert.equal(saved.review_status, 'pending_review');
  assert.equal(saved.status, 'draft');
});

test('resubmissions must have a five-hour server review window', async () => {
  await assert.rejects(submitSavedGigForReview(clientFor('pending_review', 'draft', '2026-10-17T19:00:00.000Z'), 'gig'), /Pending Review/);
});

test('a returned gig cannot report successful submission while still Changes Required', async () => {
  await assert.rejects(submitSavedGigForReview(clientFor('changes_required'), 'gig'), /Pending Review/);
});

test('a corrected gig cannot bypass review and become publicly active', async () => {
  await assert.rejects(submitSavedGigForReview(clientFor('published', 'active'), 'gig'), /Pending Review/);
});

test('server rejection is shown instead of successful submission', async () => {
  const client = clientFor();
  client.rpc = async () => ({ error: { message: 'Not allowed' } } as any);
  await assert.rejects(submitSavedGigForReview(client, 'gig'), /Not allowed/);
});