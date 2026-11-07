# Mobile-first FIVESOM redesign

## Buyer acquisition and search visibility
- [x] Audit live Fivesom presence and existing buyer/SEO features against the supplied brief
- [x] Improve buyer-focused discovery, shared buyer guide/prerender content, canonical URLs and consented acquisition measurement while preserving workflows
- [x] Verify public buyer guide → services → Explore search, canonical and mobile widths 320–430px; no runtime errors
- [x] Add Admin/Founder Buyer Activity with date-filtered account/order counts from existing protected tables, not fabricated traffic metrics
- [ ] Verify Buyer Activity with a signed-in admin — blocked by external unmanaged authentication
- [ ] Publish updated site to fivesom.net and confirm live crawl — requires owner's Netlify deployment; Google ranking is not guaranteed
- [ ] Connect external Google Analytics traffic reports to the dashboard — no authorized reporting connection available; existing dashboard explicitly labels this limitation

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
