import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { canShowJobPosting } from '../src/lib/jobPostingAccess';
import type { AccountState } from '../src/lib/accountState';

const buyer: AccountState = {
  authenticated: true, emailVerified: true, activeRole: 'buyer', selectedRole: 'buyer',
  onboardingStatus: 'complete', profileComplete: true,
  profile: { full_name: null, location: null, professional_title: null, bio: null,
    industry: null, profile_image_url: null, username: null, email: null },
};

describe('Buyer-only job posting visibility', () => {
  it('allows a completed buyer account', () => assert.equal(canShowJobPosting(buyer), true));
  it('excludes freelancers, including a stale buyer selection', () => {
    assert.equal(canShowJobPosting({ ...buyer, activeRole: 'freelancer', selectedRole: 'freelancer' }), false);
    assert.equal(canShowJobPosting({ ...buyer, activeRole: 'freelancer' }), false);
  });
  it('excludes admin, founder and member accounts', () => {
    for (const activeRole of ['admin', 'founder', 'super_admin', 'user']) {
      assert.equal(canShowJobPosting({ ...buyer, activeRole }), false);
    }
  });
  it('fails closed while loading, signed out, incomplete or unavailable', () => {
    assert.equal(canShowJobPosting(buyer, true), false);
    assert.equal(canShowJobPosting(null), false);
    assert.equal(canShowJobPosting({ ...buyer, authenticated: false }), false);
    assert.equal(canShowJobPosting({ ...buyer, onboardingStatus: 'incomplete' }), false);
  });
});