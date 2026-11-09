# Mobile-first FIVESOM redesign

## Jobs marketplace
- [x] Add secure buyer jobs, manual one-hour review, applications, follows, CV snapshots and hiring agreements
- [x] Add Explore Jobs, buyer My Jobs, Admin/Founder Job Approvals and freelancer applications
- [x] Generate real-profile CV previews and PNG downloads with Fivesom.net watermark
- [x] Connect accepted agreements to existing orders/payment without changing gig workflows
- [x] Test validation and public/mobile views; 15 regression tests pass and 320–834px public views have no overflow
- [ ] Verify signed-in posting, approval, CV export, application and real checkout — blocked by external unmanaged authentication; no real jobs exist for public detail verification

## Buyer acquisition and search visibility
- [x] Audit November 9 brief and live Fivesom; polish buyer-first Google/page copy and preserve freelancer opportunities
- [x] Add public Jobs discovery, paginated approval-filtered sitemap, private buyer acquisition summary and consent-aware analytics initialization
- [x] Verify public buyer journeys and 20 regression tests; save truthful audit and next steps
- [ ] Verify deployed Netlify copy, Google index coverage, GA4 country/referral/conversion reports and signed-in growth screen — blocked by external deployment/report access and unmanaged authentication
- [ ] Confirm specific bilingual/service buyer content with real customer project evidence before creating segment pages; no fabricated offers or country inventory

## Email restoration
- [x] November 9: verify provider acceptance, repair retry throttling and audit gig/message/event coverage; five fresh queued emails received provider IDs after throttling
- [x] Deploy deduplicated Admin/Founder gig submission/resubmission notification sender and correct review links
- [ ] Complete presence-aware grouping and additional revision/review/dispute/payment/withdrawal event coverage; implementation remains outstanding, inbox and signed-in tests require recipient evidence/unmanaged authentication
- [x] Diagnose notification failure: deployed email requests return provider 403 project authorization denied
- [x] Restore shared provider path for messages/support/news; provider IDs verified, direct-key configuration no longer requires gateway keys
- [x] Verify existing email outbox and active once-per-minute retry schedule; failed notifications remain queued
- [ ] Verify new gig and paid-order inbox delivery — no real submission/order test or recipient inbox evidence available

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
