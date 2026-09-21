# Complete Fivesom frontend architecture and UI

## Goal
Unify the existing Fivesom marketplace into a polished, production-ready experience while preserving all working marketplace, security, payment, messaging, and dashboard behavior.

## Build scope
- Standardize visible branding to “Fivesom” across navigation, authentication, page headings, loading states, and app metadata; remove inconsistent spellings and avoid exposing technical identifiers.
- Refine the shared navigation and responsive mobile menu so buyer, freelancer, member, and signed-out actions remain clear and consistent.
- Polish the existing landing page experience: service search, categories, live gigs, featured freelancers, trust/escrow messaging, how-it-works content, and calls to action.
- Improve the marketplace browsing experience with a clearer search/filter area, responsive gig grid, loading/empty states, pricing, ratings, and seller context while retaining real Supabase data.
- Unify login, signup, and role-upgrade screens around one professional authentication presentation, preserving Google/email flows, confirmation behavior, password recovery, and the existing neutral-member onboarding model.
- Harmonize buyer and freelancer dashboard presentation without redesigning their established structure or changing workflows; keep profile, orders, messaging, wallet/payout, help, and settings views intact.
- Normalize Supabase media presentation through existing safe URL and signed-file helpers, showing user-friendly labels instead of infrastructure URLs while preserving public/private storage rules.
- Keep the current route-level code splitting, query caching, protected-route behavior, realtime subscriptions, SEO components, sitemap checks, and production SPA fallback.

## Technical approach
- Continue with the project’s supported React 18 + Vite + TypeScript + Tailwind stack. A Next.js migration is intentionally excluded because this Lovable project does not support Next.js and migrating would risk existing functionality.
- Use semantic design tokens and existing shared UI components for controls; remove raw one-off control styling where touched.
- Create or refine small shared presentation components only where they reduce duplication across public, auth, and dashboard screens.
- Do not alter database tables, RLS policies, payment calculations, role rules, commissions, verification logic, or private storage permissions for this frontend-focused request.

## Verification
- Check desktop and mobile layouts for the homepage, navigation, authentication, Explore, representative gig/profile pages, and signed-out dashboard redirects.
- Exercise search, filters, navigation, role entry points, and media rendering against real Supabase-backed content.
- Run route validation and targeted checks, then confirm the preview build has no errors.
