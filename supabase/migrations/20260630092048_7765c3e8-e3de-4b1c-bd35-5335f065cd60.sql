GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_deliveries TO authenticated;
GRANT ALL ON public.order_deliveries TO service_role;
ALTER TABLE public.order_deliveries ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();