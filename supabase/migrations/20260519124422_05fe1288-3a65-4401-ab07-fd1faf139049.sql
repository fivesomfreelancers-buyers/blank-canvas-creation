
ALTER TABLE public.withdrawals
  ADD COLUMN IF NOT EXISTS receiver_first_name text,
  ADD COLUMN IF NOT EXISTS receiver_middle_name text,
  ADD COLUMN IF NOT EXISTS receiver_last_name text,
  ADD COLUMN IF NOT EXISTS swift_code text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS reason text,
  ADD COLUMN IF NOT EXISTS method text;
