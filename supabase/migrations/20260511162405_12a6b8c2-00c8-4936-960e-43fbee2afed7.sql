ALTER TABLE public.order_deliveries ADD COLUMN IF NOT EXISTS revision_feedback text;
ALTER TABLE public.order_deliveries ADD COLUMN IF NOT EXISTS revision_requested_at timestamp with time zone;