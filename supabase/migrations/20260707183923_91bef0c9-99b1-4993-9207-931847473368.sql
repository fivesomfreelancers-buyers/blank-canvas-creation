
-- Add fee tracking columns to withdrawals
ALTER TABLE public.withdrawals
  ADD COLUMN IF NOT EXISTS fee_percent numeric NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS fee_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_amount numeric NOT NULL DEFAULT 0;

-- Server-side function to compute the current freelancer withdrawal fee percent.
-- Fixed at 15% per platform policy. Centralized so future changes are one place.
CREATE OR REPLACE FUNCTION public.get_withdrawal_fee_percent()
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$ SELECT 15::numeric $$;

-- Trigger to enforce fee calculation on insert/update, ignoring any client-provided values
CREATE OR REPLACE FUNCTION public.enforce_withdrawal_fee()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _pct numeric;
BEGIN
  _pct := public.get_withdrawal_fee_percent();
  NEW.fee_percent := _pct;
  NEW.fee_amount  := ROUND((COALESCE(NEW.amount,0) * _pct / 100)::numeric, 2);
  NEW.net_amount  := ROUND((COALESCE(NEW.amount,0) - NEW.fee_amount)::numeric, 2);
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_enforce_withdrawal_fee ON public.withdrawals;
CREATE TRIGGER trg_enforce_withdrawal_fee
BEFORE INSERT OR UPDATE OF amount ON public.withdrawals
FOR EACH ROW EXECUTE FUNCTION public.enforce_withdrawal_fee();

-- Backfill existing rows with correct fee/net based on 15%
UPDATE public.withdrawals
SET fee_percent = 15,
    fee_amount = ROUND((amount * 15 / 100)::numeric, 2),
    net_amount = ROUND((amount - (amount * 15 / 100))::numeric, 2);
