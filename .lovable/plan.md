# FIVESOM Search + AI Search Foundation

## What the live audit of fivesom.net found

- **Google sees the same page everywhere.** Every URL (home, /freelancers/somalia, gigs) serves one title, "Fivesom — Freelance Services, Jobs & Remote Talent", and **no meta description** in the HTML Google first receives. Per-page titles only appear after JavaScript runs.
- **Pages are empty without JavaScript.** The raw HTML is about 4 KB with an empty `#root`. There is no H1, no text and no links, so crawlers that don't run JavaScript (most AI search bots, Bing's first pass) see nothing about FIVESOM.
- **Soft 404s.** Made-up URLs such as /nope-xyz return 200 instead of 404.
- **Live sitemap is behind.** Production lists 201 URLs with **zero gigs and zero freelancer profiles**. The project sitemap has 14 gigs and 12 profiles, but it is only refreshed when the site is built.
- **Brand wording is inconsistent.** "Fivesom" / "FIVESOM" appear with different taglines ("Freelance Services, Jobs & Remote Talent" versus "African & Somali Freelancer Marketplace").
- **Working already:** www and http redirect to https://fivesom.net with a single 301, robots.txt allows public pages, and country pages exist.

## Fixes

### 1. Real HTML for every public page (the biggest fix)
Add a build step that renders a static HTML file for each public route: home, about, how-it-works, explore, services and categories, country pages, docs, blog and legal pages. Each file carries its own title, description, canonical, og/twitter tags, JSON-LD, H1, main text and plain links. React then takes over as usual, so visitors see no change. Gig and freelancer pages keep the existing Netlify edge function, which is extended to also add visible H1/description/price/seller text and breadcrumb links.

### 2. One consistent brand identity
Use "FIVESOM — African & Somali Freelancer Marketplace" as the single tagline across index.html, the Organization/WebSite schema (including `alternateName` "FIVESOM.net"), the footer, About, and og:site_name. The homepage title becomes "FIVESOM — African & Somali Freelancer Marketplace | Hire Freelancers Worldwide". The H1 becomes "Hire Skilled African Freelancers", followed by a factual sentence that also mentions Somali freelancers.

### 3. Unique titles and descriptions
Audit every route's SEO props and fix duplicates, using the requested patterns for categories, countries, freelancers ("Name — Skill | FIVESOM") and gigs ("Gig Title | Category | FIVESOM"). Add a dedicated, genuinely useful "Hire Somali Freelancers" intent section on the Somalia page and "Hire African Freelancers" on the Africa hub. These are not new doorway pages.

### 4. Country pages
Check each existing country entry for unique content (local talent, strong categories, time zone and language fit, payout methods). Rewrite any that are only template swaps. Each page links to the live gigs and freelancers from that country, when any exist.

### 5. Internal linking
- Africa hub links to all country pages.
- Services hub links to all 9 categories and their subcategories.
- Category pages link to related categories and countries.
- Gig pages link to the category, the seller and the country.
- The footer gets descriptive links for "Freelancers in Africa" and the main categories.

### 6. Factual Q&A content for AI search
Expand the existing homepage FAQ, About and How It Works pages with short factual answers: What is FIVESOM? How does escrow work? How do freelancers get paid? How can I hire a Somali or African freelancer? How can a freelancer join? This goes on visible pages only, with no hidden text. Update llms.txt to mirror the same facts.

### 7. Structured data (only what is visible on the page)
- Organization + WebSite on the homepage.
- BreadcrumbList on categories, countries, gigs, profiles and docs.
- Service/Offer on gigs, with the price only when it is visible.
- ProfilePage/Person on freelancers.
- AggregateRating only when real reviews exist.

### 8. Canonicals, 404s, sitemap
- Canonicals strip query, filter and tracking parameters and use no trailing slash.
- Explore pages with filters get `noindex, follow`.
- Unknown URLs return a real 404: Netlify 404 handling for non-routes, and the edge function returns 404 for gigs and profiles that don't exist.
- The sitemap generator keeps its current approach and still runs on every build. Remove private /register and /delete-account entries, and fix lastmod per the site's policy.

### 9. Images
Each gig uses its own photo for og:image and in the sitemap image entries, and keeps its descriptive alt text. The logo is referenced consistently.

### 10. Performance
Defer non-critical third-party scripts, lazy-load images below the fold, and split large admin/dashboard code out of the public bundle.

## Verification
- curl each public URL type and confirm a unique title/description/H1/canonical in the raw HTML.
- Confirm real 404s and validate JSON-LD.
- Run a sitemap and robots check, plus route validation and a mobile overflow check.

## What only you can do after publishing
- Redeploy on Netlify.
- In Google Search Console, submit https://fivesom.net/sitemap.xml and request indexing for key pages. I can connect Search Console for you if you want.

No users, gigs, orders or other data are touched. Rankings can't be guaranteed; this builds the strongest legitimate foundation.
