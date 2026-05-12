## Goal

Rebuild the freelancer verification flow and public profile to feel like Fiverr/Upwork: gated by first completed order, multi-step structured application, rich public profile, and a verified badge that appears everywhere.

## 1. Gating: when verification appears

- On `FreelancerDashboard`, only show the "Verify Your Account" card if `freelancers.completed_orders >= 1`.
- Before that: show a friendly locked card explaining "Complete your first order to unlock verification."
- After submission: show pending state for 24h (per existing rule), then allow re-check.
- After admin approval: card disappears from dashboard; verified badge appears on profile + cards.

## 2. New verification application (multi-step wizard)

Replace the current `FreelancerVerify` page with a 6-step wizard. Each step is one section, with progress indicator (reuse `StepIndicator`).

**Step 1 – Basic Info (auto-filled)**
- Pulls `full_name`, `profile_image_url`, `languages`, `location` from `profiles`.
- Editable inline; saving updates `profiles` directly (no duplication).

**Step 2 – Skills**
- Category dropdown sourced from existing `categories` table.
- On category select → load `subcategories` for that category.
- Multi-select subcategories saved as freelancer skills.

**Step 3 – Portfolio**
- Upload exactly 3 images + 1 video (max 60s, validated client-side via `video.duration`).
- Stored in new `verification-portfolio` public bucket.
- Saved to new `freelancer_portfolio` table.

**Step 4 – Experience**
- Single select: `< 1 year`, `1 year`, `2 years`, `3 years`, `5+ years`, `10+ years`.

**Step 5 – Education**
- Single select: `High School`, `Diploma`, `Bachelor`, `Master`, `PhD`.

**Step 6 – Software / Tools**
- Searchable multi-select with a curated catalog (Figma, Canva, Photoshop, Illustrator, VS Code, React, Node.js, Premiere Pro, After Effects, etc.).
- Each item rendered with its logo (using `simple-icons` CDN: `https://cdn.simpleicons.org/{slug}`) so logos appear automatically beside name.

Final step submits one row to `verification_documents` (existing table) and writes structured data to `freelancers` and the new tables.

## 3. Database changes

New columns on `freelancers`:
- `years_experience text`
- `education_level text`
- `software_tools jsonb` (array of `{name, slug}`)
- `professional_title text` (mirror; keep canonical on profiles)

New table `freelancer_portfolio`:
- `id, freelancer_id, media_url, media_type ('image'|'video'), position, created_at`
- RLS: anyone can SELECT; owner can INSERT/UPDATE/DELETE.

New storage bucket `verification-portfolio` (public) with owner-write RLS.

(All other verification data still flows through existing `verification_documents` admin queue.)

## 4. Public freelancer profile page

Rebuild `FreelancerProfilePage` (the public one) with sections:
- Hero: avatar, name, professional title, city/country, verified badge, languages, rating, reviews count, completed orders.
- About.
- Skills (chips).
- Portfolio gallery (3 images + video player).
- Experience + Education cards.
- Software/tools grid with logos.
- Reviews list.

## 5. Profile card component

New `FreelancerProfileCard` reusable component matching the uploaded reference style: avatar circle with verified check, name, title, location, star rating + reviews count, skill chips, "View Profile" CTA. Used in Explore + featured grids.

## 6. Verified badge

Small reusable `VerifiedBadge` (blue check) shown wherever freelancer name appears once `freelancers.is_verified = true`.

## Technical notes

- Categories/subcategories: query `categories` + `subcategories` tables already in DB.
- Software logos: `https://cdn.simpleicons.org/{slug}/3B82F6` — no extra package needed.
- Video duration check: read `loadedmetadata` event before upload.
- Gating uses existing `completed_orders` field updated by `handle_order_completion` trigger.
- Migration will add columns, the portfolio table with RLS, and the storage bucket + policies in one call.

## Out of scope

- Admin-side review UI changes (existing AdminUsers verification queue keeps working).
- Payment / order flow changes.
