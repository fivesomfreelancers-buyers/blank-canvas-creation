# Project rules

- New and corrected gigs share the server review submission helper; confirm the persisted review state before reporting success so editing cannot bypass approval.
- Message, order, and system notification sends share the provider helper and stable event idempotency keys; report success only with a provider acceptance ID.
- Public page canonicals use the shared SEO URL helper in client metadata, sitemap and prerender; keep media resolution separate so hosting redirects and asset URLs stay consistent.
- Prerendered structured data shares the visible page schema sources and is replaced on client mount, preventing crawler-only claims and duplicate schema.
- Buyer funnel events require analytics consent and contain no free text, user/order IDs or payment details; verified payment events are measurement only, never the financial ledger.
- Buyer guide content is shared by the visible homepage and prerender output so acquisition content stays consistent for visitors and crawlers.