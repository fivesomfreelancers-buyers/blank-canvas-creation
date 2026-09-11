# Blue Tick Eligibility & Verification

## Goal
Keep the current FIVESOM freelancer dashboard unchanged in structure and visual identity, while filling its empty desktop sidebar area and dashboard content with a secure, realtime Blue Tick system. Verified Seller remains a separate green identity status; Blue Tick remains a higher-level blue recognition.

## Freelancer experience
- Add a compact Blue Tick Eligibility panel to the highlighted sidebar space on desktop and a stacked dashboard card on smaller screens.
- Show all seven live requirements: identity, 40-day account age, activity within 30 days, 10 completed orders, $50 eligible completed Gig earnings, 4.5 rating, and no more than 3 active warnings.
- Use clear complete/incomplete states, progress bars for numeric goals, overall `x / 7`, and accurate messages for unverified, incomplete, eligible, pending, more-information, rejected, approved, and revoked states.
- Link unverified users to the existing identity verification screen. Keep Apply disabled until the server confirms every requirement.
- Replace the current inline form with a focused application dialog/page containing optional experience fields and typed social links with icons.
- Show current verified profile information without requesting identity documents again.

## Trusted database and security
- Expand `blue_tick_applications` for specialties, project summary, social links, Persona inquiry/session reference, liveness status, rejection reason, review state, and timestamps.
- Create a dedicated `user_warnings` table with active/expired/removed lifecycle, reason, issuer, expiry, and audit timestamps. Users may read only their own warnings; only Admin/Founder roles may manage them.
- Create immutable Blue Tick action history records for submission, information requests, approval, rejection, revocation, and warning actions.
- Add a server-calculated eligibility function using trusted rows only:
  - account age from profile creation
  - recent activity from `last_seen`
  - completed order count from completed orders
  - earnings from completed `freelancer_earnings` values, excluding the Buyer Service Fee
  - rating from genuine Gig reviews
  - active warnings from the new warnings table
  - identity status from approved verification/freelancer verification
- Add a submission function that derives the logged-in user, rechecks all seven requirements, forces a safe pending state, blocks duplicate pending applications, and rejects caller-supplied ownership/status values.
- Tighten freelancer updates so users cannot change identity, rating, completed orders, earnings, warnings, Blue Tick, VIP, or payout trust fields themselves.
- Update admin functions to revalidate eligibility, require role checks, require rejection/removal reasons, support “Request More Information,” synchronize `has_blue_tick`, and write audit entries atomically.
- Preserve historical applications and existing approved data.

## Persona liveness verification
- Add a server-side Persona session-creation endpoint that authenticates the user and binds each Persona inquiry to that exact FIVESOM account/application.
- Add a Persona webhook endpoint that verifies Persona’s webhook signature before updating liveness status; the browser cannot mark liveness complete.
- Use Persona’s hosted flow for camera guidance and desktop-to-mobile handoff/QR behavior. No fake camera or ordinary photo-upload fallback will be presented as liveness.
- Keep final Blue Tick submission locked until Persona reports a successful verification.
- Required setup after the endpoints exist: Persona API key, template ID, environment ID if required by the account, and webhook signing secret stored securely. These are third-party credentials and must be supplied from the user’s Persona dashboard.

## Admin and Founder review
- Keep the existing admin shell and add Blue Tick Applications under Verification with realtime pending count.
- Upgrade the list and detail view to show profile/photo, username, location, languages, skills, experience, education, software, portfolio, social links, trusted eligibility snapshot, identity status, Persona liveness result, and complete action history.
- Add Approve, Reject, Request More Information, and Remove Blue Tick actions. Rejection/removal require a reason.
- Make the same secured review screen available to Founder management, using server-side roles rather than frontend labels.
- Show all Blue Tick actions in the existing admin activity log.

## Realtime and badge consistency
- Publish and subscribe to the relevant Blue Tick, warning, freelancer, profile, review, verification, and order changes.
- Refresh eligibility on realtime events and on a small timed boundary check so account-age/activity states remain accurate without manual refresh.
- Update the existing reusable badge flow so Blue Tick appears consistently on freelancer profiles, Gig cards/search, featured freelancer cards, Gig details, messages, and relevant order pages, while Verified Seller remains visibly distinct.

## Validation
- Add database-level tests/probes for anonymous, normal user, freelancer, Admin, and Founder boundaries.
- Verify users cannot forge eligibility, ownership, liveness, application status, Blue Tick, earnings, ratings, orders, or warnings.
- Test unverified, partially eligible, fully eligible, submitted, more-information, approved, rejected, and revoked states.
- Test duplicate submission prevention, mandatory reasons, action logs, automatic badge activation, and realtime updates.
- Check desktop, laptop, tablet, and mobile layouts against the existing dashboard style; run type/build checks and browser interaction tests.

## External prerequisite
Persona is not connected and no Persona credentials are currently stored. The database, UI, secure endpoints, and locked provider flow can be built first; end-to-end liveness completion remains blocked until the Persona credentials and webhook configuration are supplied.
