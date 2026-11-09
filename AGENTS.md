# Project rules

- New and corrected gigs share the server review submission helper; confirm the persisted review state before reporting success so editing cannot bypass approval.
- Message, order, and system notification sends share the provider helper and stable event idempotency keys; report success only with a provider acceptance ID.
- Gig review emails queue once per review-history event and staff recipient; the sender revalidates staff roles and shares the notification provider helper.
- Public page canonicals use the shared SEO URL helper in client metadata, sitemap and prerender; keep media resolution separate so hosting redirects and asset URLs stay consistent.
- Prerendered structured data shares the visible page schema sources and is replaced on client mount, preventing crawler-only claims and duplicate schema.
- Buyer funnel events require analytics consent and contain no free text, user/order IDs or payment details; verified payment events are measurement only, never the financial ledger.
- GA loads only after analytics consent with automatic page tracking disabled so private checkout URLs are not collected.
- Buyer guide content is shared by the visible homepage and prerender output so acquisition content stays consistent for visitors and crawlers.
- Public marketplace positioning is shared between homepage metadata, visible copy and prerender output so buyer and freelancer offers remain consistent.
- Buyer acquisition summaries use a server-authorized Admin/Founder aggregate RPC; unknown external source metrics stay unavailable rather than fabricated.
- Sitemap reads paginate and fail without replacing the previous file when public sources fail; only approved open jobs and published gigs are listed to keep private work out of search.
- Jobs use separate job/application/agreement records and authenticated database RPCs; public reads are approval-gated and hiring enters the existing idempotent paid-order pipeline so gig workflows and the financial ledger stay intact.
- CV previews and exports share the same real-profile snapshot component; private application files use signed Storage URLs so public profile content does not make proposals public.