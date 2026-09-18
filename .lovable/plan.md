# Documentation rebuild (4 languages, chapter pages) + Africa SEO foundation

## Part 1 — Documentation: one chapter at a time

Today `/docs` stacks all 21 topics on one long page with hash links. Instead:

- Each chapter gets its own real page: `/docs/getting-started`, `/docs/creating-a-gig`, `/docs/withdrawals`, etc.
- `/docs` becomes a clean overview: short intro, search, and the chapter groups as cards.
- The left sidebar stays visible on every chapter page and shows the grouped chapter list, with the current chapter highlighted. Clicking a chapter opens only that chapter — no endless scrolling.
- Each chapter page keeps: breadcrumb (Home › Documentation › Chapter), one H1, short sections, bullets, its related instructional video, related-chapter links, previous/next chapter buttons, and a CTA.
- Old `/docs#topic-id` links keep working: they redirect to the matching chapter page, so nothing 404s. Footer and other internal links get updated to the new URLs.

## Part 2 — Verification and Blue Tick chapters

The current single topic is split into two proper chapters with real detail:

- **Account Verification** — what identity verification is, the documents accepted, where they are uploaded, how review works, what the green Verified badge means.
- **Blue Tick** — that it is granted only by FIVESOM admins, the 100-day account age and performance requirements, the 3-step application (professional info, identity info, face check), and what it does and does not mean.

## Part 3 — Documentation in English, Somali, Arabic, French

- A language switcher on the documentation pages: English, Somali, Arabic, French.
- Chapter titles, summaries, section headings and body text are translated per language (hand-written, not machine-dumped filler). Arabic renders right-to-left.
- URLs carry the language: `/docs/creating-a-gig` (English) and `/docs/so|ar|fr/creating-a-gig`, each with its own title, description, canonical and hreflang links so Google serves the right language.
- Choice is remembered between visits.

## Part 4 — Africa / market pages (real content only)

New pages under `/freelancers/...`, each with unique copy, not a template with a swapped country name:

- `/freelancers/africa` — the hub: what FIVESOM is for African freelancers and clients, categories, how orders and escrow work, how freelancers get paid, how to join.
- `/freelancers/somalia`, `/freelancers/somaliland`, `/freelancers/ethiopia`, `/freelancers/djibouti` — market-specific: local payment/payout reality (mobile money), languages, in-demand services, what clients abroad hire for, how to start.
- `/freelancers/kenya`, `/freelancers/nigeria` — added only because there is genuine payout and demand detail to write for them.

No other country pages will be created. Thin duplicate country pages would be treated as spam by Google and would hurt the site.

Each page: unique H1/title/description, breadcrumbs, structured data, links down to categories, gigs and documentation, and a clear CTA to register.

## Part 5 — Site-wide SEO clean-up

- Homepage, Explore, Services, How It Works, About and Blog headings and intros rewritten where they are thin, using natural phrasing people actually search ("hire African freelancers", "Somali freelancer marketplace") without stuffing.
- Freelancer profile pages: unique title/description from name, headline, skills, category and public country; breadcrumbs; ProfilePage/Person structured data; gig links. No private data exposed.
- Gig pages: check title/description uniqueness and Product/Offer structured data.
- Remove the unused meta-keywords tag from `index.html` (Google ignores it).
- Sitemap: add every documentation chapter (all four languages) and the new market pages; robots.txt reviewed so nothing public is blocked.
- Verify canonicals self-reference, 404 page is noindex, and no duplicate URLs.

## Part 6 — Check and report

- Build must pass; pages checked on desktop and mobile widths.
- Every documentation and market link clicked through to confirm no 404s.
- Honest report at the end: what was implemented and verified vs. what depends on Google. Rankings are not promised — publishing the site is required before Google can see any of this.

## Technical notes

- New `src/pages/docs/` with a chapter layout, `src/content/docs/{en,so,ar,fr}.ts` chapter data, route `/docs/:slug` and `/docs/:lang/:slug` in `App.tsx`, plus a redirect map for old hash anchors.
- New `src/pages/markets/FreelancerMarket.tsx` driven by `src/content/markets.ts`, routed at `/freelancers/:market`.
- `scripts/generate-sitemap.ts` extended to enumerate chapters, languages and markets from the same data files.
- No database, auth, payment or dashboard changes.
