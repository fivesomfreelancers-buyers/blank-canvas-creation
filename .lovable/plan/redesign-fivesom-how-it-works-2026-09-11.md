# Redesign FIVESOM “How It Works”

## Goal
Replace the current long, inconsistent page with one polished A–Z guide for buyers and freelancers, using the four supplied illustrations in their exact order.

## Page structure
1. Add a clear opening section with one H1, concise explanation, buyer/freelancer actions, and an A–Z journey strip.
2. Rebuild the four main sections in this exact order:
   - Find Your Perfect Freelancer — image 1
   - Collaborate Securely — image 2
   - Secure Escrow Payment — image 3
   - Release Payment — image 4
3. Add a four-step freelancer journey matching the structure of the supplied reference: account, publish a Gig, complete orders, get paid.
4. Add separate, detailed sections for standard verification, the review process, Blue Tick eligibility, application information, and identity/camera verification.
5. Add concise buyer and freelancer journey summaries, trustworthy FAQs, and links to Explore and freelancer registration.
6. Remove the old unsupported or unrelated claims, fake testimonials, event copy, duplicated support/legal content, and empty heading area from this page.

## Visual direction
- Keep FIVESOM’s current dark/light theme and cyan brand accent.
- Use clean alternating full-width content bands rather than nested decorative cards.
- Make each supplied illustration prominent, properly sized, and readable on desktop, tablet, and mobile.
- Use compact numbered markers, process lines, restrained motion, and accessible contrast.
- Preserve the exact image order; the fifth upload is design inspiration only and the sixth is the old-page reference only.

## Technical details
- Optimize the four supplied PNG files to descriptive WebP assets, upload them through the project asset flow, and render them as normal crawlable images with fixed dimensions, descriptive alt text, and lazy loading below the first image.
- Rebuild `HowItWorks.tsx` with semantic `header`, `main`, `section`, ordered lists, one H1, H2 major headings, and H3 step headings.
- Use only claims supported by the implemented product. Describe camera/QR identity checks conditionally so the page does not imply FIVESOM performs biometric verification itself.
- Set the requested unique title, description, self-referencing canonical URL, index/follow directive, and social metadata through the existing SEO component.
- Add valid `WebPage` and `BreadcrumbList` JSON-LD matching visible content; avoid unsupported HowTo rich-result claims.
- Keep `/how-it-works` in the generated sitemap and include its four public image URLs in that page’s sitemap entry.
- Verify the final page at desktop and mobile widths, check image loading and overflow, and confirm the project build is healthy.

## Scope
No payment, verification, identity-provider, or database workflow will be changed; this redesign accurately documents the platform’s existing behavior.
