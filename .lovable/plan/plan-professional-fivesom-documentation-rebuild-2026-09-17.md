# Plan: Professional FIVESOM Documentation Rebuild

## Goal
Rebuild `/docs` into a clean, professional documentation experience for FIVESOM with clear structure, focused topics, relevant videos, no mixed decorative images, stronger SEO copy, and working internal links.

## What will change

### 1. Rebuild the Documentation page layout
- Replace the current long mixed documentation page with a modern docs-style layout:
  - A concise introduction at the top
  - Sticky desktop sidebar navigation
  - Mobile documentation menu
  - Grouped sections with clear headings
  - Searchable/scan-friendly topic cards
  - Clean topic detail sections
  - Related-topic links at the bottom of each topic
- Keep the existing dark FIVESOM theme and brand styling.
- Remove the current decorative/content images from documentation sections.
- Keep instructional videos only inside the topic they support.

### 2. Documentation information architecture
Create approximately 20 focused documentation topics, grouped like this:

```text
Documentation
├─ Getting Started
│  ├─ Getting Started with FIVESOM
│  ├─ Creating Your Account
│  └─ Account & Security
├─ Freelancers
│  ├─ Freelancer Profile
│  ├─ Creating a Gig
│  ├─ Gig Packages & Pricing
│  ├─ Delivering an Order
│  ├─ Freelancer Earnings & Fees
│  └─ Withdrawals
├─ Buyers
│  ├─ Finding Freelancers
│  ├─ Buying a Gig
│  ├─ Order Requirements
│  └─ Reviewing a Delivery
├─ Orders & Delivery
│  ├─ Messaging & Communication
│  ├─ Revisions
│  └─ Disputes
├─ Payments & Security
│  ├─ Escrow & Payments
│  └─ Privacy & Trust
├─ Verification & VIP
│  ├─ Verification & Blue Tick
│  └─ VIP Membership
└─ Support
   └─ FIVESOM Support
```

### 3. Video placement
Keep existing videos, but move them into the correct topic only:
- Account video → Creating Your Account
- Create gig video → Creating a Gig
- Ordering video → Buying a Gig
- Messaging video → Messaging & Communication
- Orders video → Delivering an Order / order tracking content
- Buyer acceptance video → Reviewing a Delivery
- Dispute video → Disputes
- Withdrawal/payment video → Withdrawals

No unrelated video gallery will be added.

### 4. Content rewrite and SEO cleanup
- Rewrite `/docs` copy in clean English with short paragraphs, bullets, and step-by-step guidance.
- Keep the content useful and concise, not a wall of text.
- Add one clear H1, logical H2/H3 sections, and topic summaries.
- Add SEO metadata and JSON-LD for the documentation page.
- Add internal links between related topics and existing platform pages such as `/explore`, `/how-it-works`, `/register`, `/create-gig`, `/freelancer/profile`, `/freelancer/wallet`, `/freelancer/verify`, `/vip`, and support/legal pages.

### 5. Website-wide content/link review
- Review key public pages and shared navigation for weak or broken documentation links:
  - Homepage documentation links
  - Footer documentation/help links
  - How It Works links
  - About/support links where relevant
- Fix documentation hash links so they land on real sections and do not create 404s.
- Avoid redesigning unrelated pages; only improve copy/linking where it directly supports documentation clarity and SEO.

## Technical notes
- Main work will be in `src/pages/Docs.tsx`.
- Existing `SmartVideo` will be used for videos.
- Existing documentation image imports and image rendering will be removed from `/docs`.
- Use semantic tokens and existing UI components.
- No backend/database changes are needed because this is content, navigation, SEO, and presentation work.
- After edits, verify build health and inspect `/docs` on desktop and mobile for layout, links, and video placement.
