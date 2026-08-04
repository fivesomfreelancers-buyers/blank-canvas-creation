ALTER TABLE public.freelancers
  ADD COLUMN IF NOT EXISTS stripe_account_id text,
  ADD COLUMN IF NOT EXISTS stripe_payouts_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_charges_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_details_submitted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_onboarded_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS freelancers_stripe_account_id_key
  ON public.freelancers (stripe_account_id) WHERE stripe_account_id IS NOT NULL;

REVOKE UPDATE (stripe_account_id, stripe_payouts_enabled, stripe_charges_enabled, stripe_details_submitted, stripe_onboarded_at)
  ON public.freelancers FROM authenticated;

GRANT ALL ON public.freelancers TO service_role;