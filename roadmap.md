# Mobile-first FIVESOM redesign

## Jobs marketplace
- [x] Add secure buyer jobs, manual one-hour review, applications, follows, CV snapshots and hiring agreements
- [x] Add Explore Jobs, buyer My Jobs, Admin/Founder Job Approvals and freelancer applications
- [x] Generate real-profile CV previews and PNG downloads with Fivesom.net watermark
- [x] Connect accepted agreements to existing orders/payment without changing gig workflows
- [x] Test validation and public/mobile views; 15 regression tests pass and 320–834px public views have no overflow
- [ ] Verify signed-in posting, approval, CV export, application and real checkout — blocked by external unmanaged authentication; no real jobs exist for public detail verification

## Buyer acquisition and search visibility
- [ ] Complete November 9 brief: polished buyer-first Google/page copy, useful buyer discovery, sitemap/AI crawlability audit and truthful acquisition reporting
- [ ] Audit live Fivesom presence and existing buyer/SEO features against the supplied brief
- [ ] Improve buyer-focused discovery, useful service content, and acquisition measurement while preserving existing workflows
- [ ] Verify public buyer journeys and report actual changes separately from unverified search rankings

## Email restoration
- [x] Diagnose notification failure: deployed email requests return provider 403 project authorization denied
- [ ] Restore message, order, support, and news email delivery — blocked by connector authorization failure after successful relink and redeploy
- [x] Verify existing email outbox and active once-per-minute retry schedule; failed notifications remain queued
- [ ] Verify accepted notification delivery — blocked by provider authorization

- [x] Establish shared mobile viewport, safe-area, touch-target, and overflow foundations
- [x] Redesign mobile navigation and dashboard navigation without changing desktop
- [x] Rebuild mobile messaging list, chat viewport, composer, attachments, and unread indicators
- [x] Refine homepage sections, steps, motion, and footer for phones
- [x] Refine mobile search, freelancer profiles, gig details, package selection, and checkout
- [x] Refine buyer/freelancer dashboards, orders, delivery, requirements, and dispute chat
- [ ] Validate public and authenticated-capable routes at 320, 360, 375, 390, 414, and 430px plus landscape
- [x] Run lint, typecheck, route validation, and production build

## Existing unresolved verification

- [x] Fix returned-gig editing and resubmission; five regression tests verify Pending Review and the five-hour deadline
- [ ] Verify corrected-gig resubmission through a signed-in freelancer session — blocked by external unmanaged authentication

- [ ] Authenticated cross-browser onboarding checks remain blocked by external unmanaged authentication

## Completed follow-ups (Sep 27)
- [x] Copy-link buttons on freelancer profile and gig pages (verified at 390px, no errors)
- [x] Production build + prerender verified (238 static pages, canonical/meta present)
