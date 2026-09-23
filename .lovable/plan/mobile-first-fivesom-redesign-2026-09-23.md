# Mobile-first FIVESOM redesign

## Goal
Make FIVESOM feel intentionally designed for phones while preserving the current desktop experience, data, permissions, dashboards, and marketplace workflows.

## What the audit found
- Mobile chat uses a fixed browser-height calculation, so the keyboard can cover the composer.
- Message media has fixed pixel widths that can exceed a phone-sized message bubble.
- Several message, notification, footer, and dashboard controls are below comfortable touch size.
- The dashboard drawer works, but important mobile destinations and unread states take too many taps.
- The homepage hero, moving gig rail, process pages, footer, and selected decorative content exceed or crowd narrow screens.
- Freelancer order cards, delivery actions, requirements, dispute chat, and dashboard headers are less responsive than their buyer equivalents.
- Public search is usable, but filters, pagination, cards, and consent controls need tighter phone-specific treatment.

## Implementation

### 1. Mobile foundations
- Add safe-area spacing, dynamic viewport-height utilities, consistent 44px touch targets, robust wrapping, and phone-specific spacing.
- Keep desktop styles unchanged behind responsive breakpoints.
- Reduce expensive motion and video loading on small screens while retaining subtle fade, slide, scale, and depth effects.

### 2. Navigation and dashboards
- Replace the compressed phone header with a focused mobile bar for logo, search/explore, messages with unread count, notifications, and profile/menu.
- Keep the existing desktop navigation intact.
- Give buyer and freelancer dashboards a compact mobile action bar/drawer with clear active state and unread/order badges.
- Prevent dashboard headers, names, badges, and return controls from colliding on narrow screens.

### 3. Messaging
- Preserve the current list-to-conversation flow, but make both views fill the usable mobile screen.
- Use dynamic viewport height and safe-area-aware composer positioning so the keyboard does not hide input controls.
- Improve conversation rows, back label, message widths, timestamps, touch targets, emoji tray, and attachment controls.
- Make image, video, PDF, and document previews responsive inside bubbles.
- Keep realtime messages and existing permission/storage behavior unchanged.
- Reconcile visible unread indicators across header, dashboard, and conversation list using existing authoritative message data.

### 4. Homepage and footer
- Recompose the hero search, rotating category text, actions, service rail, process steps, escrow, journeys, trust, reviews, and final action for phone reading order.
- Use full-width sequential process cards and lighter mobile motion.
- Turn the footer into compact expandable phone sections while keeping complete desktop columns and every existing link.

### 5. Marketplace and profile journeys
- Refine search controls into touch-friendly fields and a phone-sized filter sheet; keep results single-column on small phones and compact pagination.
- Recompose freelancer profile identity, badges, languages, skills, portfolio, gigs, reviews, and contact actions for mobile.
- Make gig media, content tabs, seller information, packages, and contact/order actions phone-first; keep the primary purchase action readily accessible.

### 6. Checkout, orders, delivery, and disputes
- Make price, buyer fee, total, payment fields, errors, and the main payment action clear without overflow.
- Standardize buyer and freelancer order cards for narrow screens.
- Stack delivery, revision, and dispute actions safely; improve upload zones, delivered-file previews, requirements, and dispute chat for touch and short landscape screens.
- Preserve all server-authorized financial and order behavior.

## Validation
- Test at 320, 360, 375, 390, 414, and 430px in portrait, plus representative phone landscape and desktop widths.
- Check overflow, clipped text, tap targets, keyboard/composer visibility, media containment, dialogs, and sticky actions.
- Exercise public pages directly and authenticated pages where the available session permits; explicitly report any externally blocked authenticated checks.
- Run lint, type checking, route validation, and production build before completion.
