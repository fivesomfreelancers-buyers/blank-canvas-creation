# Fix freelancer access and onboarding

## What will change
- Make the database account state the only authority for dashboard access: an existing Buyer/Freelancer role is complete, while a new selected role remains incomplete until the atomic completion succeeds.
- Strengthen the completion transaction so it preserves existing IDs and records, creates only missing role-specific records, returns the freshly saved account state, and never duplicates or disconnects gigs.
- Remove redirect races: wait for the authenticated session and fresh database result, use the RPC response immediately after submission, ignore stale requests, and show a loading/retry state instead of redirecting backward.
- Consolidate the legacy completion page onto the same authoritative flow so no alternate route can save only part of an account.
- Add one reusable searchable multi-language selector with a broad standardized world-language list, removable selections, and database persistence.
- Show saved languages cleanly on the public freelancer profile and preserve the existing search system while keeping language data ready for filtering.

## Verification
- Check existing freelancer/buyer records and confirm no user IDs, freelancer IDs, gigs, orders, reviews, wallets, or messages are rewritten.
- Verify the affected account state before and after completion, including profile, role, freelancer record, photo, and languages.
- Test unauthenticated/incomplete redirects in the preview, refresh behavior, and public language display.
- Run route checks, TypeScript checks, the application build signal, and the Supabase security linter.
- Authenticated cross-browser end-to-end testing will be reported separately if this external Supabase session cannot be injected into the preview.

## Technical details
- Update `get_account_state()` and `complete_role_onboarding(...)` through a Supabase migration, retaining the existing `profiles.id` and `freelancers.id` relationships.
- Update `useAccountState`, login/callback routing, route guards, registration submission, and the old completion route to consume one consistent account-state contract.
- Centralize language data and selection UI; continue storing canonical names in `profiles.languages` (`text[]`).
