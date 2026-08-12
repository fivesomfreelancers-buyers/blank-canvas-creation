CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_payment_intent_id_key
  ON public.orders (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_session_id_key
  ON public.orders (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;