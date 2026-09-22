# Premium homepage scroll narrative

## Goal
Turn the homepage from Services through the Footer into one connected, premium FIVESOM story. Keep every important sentence, route, live freelancer profile, tutorial, FAQ, CTA, and footer link accessible and crawlable.

## Experience
- **Services:** introduce subtle perspective and staggered cards; the grid recedes gently as the next chapter enters.
- **How FIVESOM Works:** replace the two long static columns with progressive Buyer and Freelancer journeys that remain fully visible in the page HTML.
- **Escrow protection:** create a clear visual rail for Buyer pays → Funds secured → Work completed → Buyer approves → Payment released, with staged progress and restrained depth.
- **Freelancer journey:** show profile → gig → buyers → orders → reputation → earnings as a connected sequence.
- **Buyer journey:** use a distinct Discover → Choose → Order → Collaborate → Approve sequence.
- **Africa to global:** add a lightweight CSS/SVG connection field communicating African talent reaching global clients; no canvas-only text or heavy 3D engine.
- **Trust:** sequence real verification, reviews, protected delivery, messaging, and dispute controls around the existing live freelancer cards.
- **Final CTA:** create a strong visual conclusion with Find a Freelancer and Become a Freelancer, then transition naturally into the existing Footer.

## Motion and performance
- Build a small shared IntersectionObserver-based reveal system using CSS transforms, opacity, perspective, and custom properties; no scroll hijacking and no heavy animation dependency.
- Animate each element once as it enters view and avoid per-frame React state updates.
- Keep the tutorial video lifecycle unchanged and avoid layering expensive effects over video or marquee content.
- Simplify perspective and parallax on mobile; prevent horizontal overflow and layout shifts.
- Under `prefers-reduced-motion`, remove transforms and sequencing so all content appears immediately with at most a simple fade.

## SEO and accessibility
- Preserve one homepage H1 and semantic H2/H3 hierarchy.
- Keep all meaningful text, ordered steps, links, and labels in the DOM without canvas or image-only copy.
- Preserve existing homepage structured data and internal links; add only natural explanatory copy where a requested journey is currently missing.
- Keep keyboard focus order logical and animations independent of interaction or content availability.

## Technical approach
- Add shared homepage motion utilities/hooks and semantic style tokens.
- Refactor the existing lower-home components rather than replacing their data sources or routes.
- Add focused journey components for Freelancer, Buyer, and Africa/global storytelling.
- Keep existing `Index`, navigation, authentication, marketplace data, payments, and Footer behavior unchanged.

## Verification
- Check desktop and mobile at representative scroll positions.
- Confirm every section is visible with reduced motion and JavaScript-disabled animation state cannot hide content permanently.
- Check one H1, heading hierarchy, internal links, no horizontal overflow, no console/runtime errors, and successful preview build.
