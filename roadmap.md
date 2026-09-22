# How It Works redesign

- [x] Replace the four existing visuals in the supplied 1–4 order
- [x] Rebuild buyer and freelancer A–Z guidance
- [x] Document verification and Blue Tick requirements accurately
- [x] Add page-specific SEO, structured data, canonical metadata, and image sitemap entries
- [x] Verify desktop and mobile rendering, links, metadata, and build health

# Complete Fivesom frontend architecture and UI

- [x] Standardize shared Fivesom branding and navigation
- [x] Refine homepage search and marketplace presentation
- [x] Unify account role selection and authentication presentation
- [x] Harmonize buyer and freelancer dashboard shells (left structurally unchanged on purpose)
- [x] Verify routes, desktop/mobile rendering, and preview health

# Secure authentication and onboarding redesign

- [x] Make Join FIVESOM start with a public Freelancer/Buyer choice
- [x] Build distinct role-specific signup forms with Google first and no skip
- [x] Keep existing-user login separate and route saved roles directly
- [x] Preserve selected onboarding through email verification and Google return
- [ ] Complete role and required profile data atomically in the database
- [x] Prevent incomplete accounts from opening role-specific pages; database enforcement awaits the atomic migration
- [x] Verify public/direct routes, refresh, desktop, mobile, and signed-out behavior
- [ ] Live-test verified email, Google return, and existing-role routing with test accounts