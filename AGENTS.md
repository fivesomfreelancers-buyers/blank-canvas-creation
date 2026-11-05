# Project rules

- New and corrected gigs share the server review submission helper; confirm the persisted review state before reporting success so editing cannot bypass approval.
- Message, order, and system notification sends share the provider helper and stable event idempotency keys; report success only with a provider acceptance ID.