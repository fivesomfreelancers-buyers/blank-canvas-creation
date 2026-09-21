-- 1. Server-derived seller earnings -------------------------------------------
CREATE OR REPLACE FUNCTION public.orders_set_freelancer_earnings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE _pct numeric;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Never allow any client to rewrite an existing order's earnings.
    NEW.freelancer_earnings := OLD.freelancer_earnings;
    RETURN NEW;
  END IF;

  SELECT COALESCE(platform_fee_percent, 15) INTO _pct FROM public.platform_settings LIMIT 1;
  _pct := LEAST(GREATEST(COALESCE(_pct, 15), 0), 100);

  NEW.freelancer_earnings := ROUND(
    GREATEST(COALESCE(NEW.amount, 0) - COALESCE(NEW.buyer_service_fee, 0), 0) * (1 - _pct / 100)
  , 2);

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_orders_set_freelancer_earnings ON public.orders;
CREATE TRIGGER trg_orders_set_freelancer_earnings
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.orders_set_freelancer_earnings();

-- 2. Idempotent delivery acceptance -------------------------------------------
DELETE FROM public.accepted_deliveries a
USING public.accepted_deliveries b
WHERE a.order_id = b.order_id AND a.ctid > b.ctid;

CREATE UNIQUE INDEX IF NOT EXISTS accepted_deliveries_order_id_key
  ON public.accepted_deliveries (order_id);

CREATE OR REPLACE FUNCTION public.accept_order_delivery(_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _o public.orders;
  _d public.order_deliveries;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Row lock serialises concurrent "Accept delivery" clicks.
  SELECT * INTO _o FROM public.orders WHERE id = _order_id FOR UPDATE;
  IF _o.id IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  IF _o.buyer_id <> auth.uid() THEN
    RAISE EXCEPTION 'Only the buyer of this order can accept the delivery';
  END IF;
  IF _o.status = 'completed'::public.order_status THEN
    RETURN;
  END IF;
  IF _o.status <> 'delivered'::public.order_status THEN
    RAISE EXCEPTION 'This order has not been delivered yet';
  END IF;
  IF COALESCE(_o.payment_status, '') NOT IN ('paid', 'succeeded', 'held', 'released', 'verified') THEN
    RAISE EXCEPTION 'Payment for this order has not been confirmed yet';
  END IF;

  SELECT * INTO _d FROM public.order_deliveries
   WHERE order_id = _order_id
   ORDER BY delivered_at DESC NULLS LAST, created_at DESC
   LIMIT 1;
  IF _d.id IS NULL THEN
    RAISE EXCEPTION 'No delivery has been submitted for this order';
  END IF;

  PERFORM set_config('app.accepting_delivery', '1', true);

  UPDATE public.orders
    SET status = 'completed'::public.order_status,
        payment_status = 'released'
    WHERE id = _order_id;

  UPDATE public.order_deliveries
    SET status = 'approved'::public.delivery_status
    WHERE id = _d.id;

  INSERT INTO public.accepted_deliveries (order_id, delivery_id, buyer_id, freelancer_id, amount, accepted_at)
  SELECT _order_id, _d.id, _o.buyer_id, f.user_id,
         GREATEST(COALESCE(_o.amount,0) - COALESCE(_o.buyer_service_fee,0), 0), now()
    FROM public.freelancers f
   WHERE f.id = _o.freelancer_id
  ON CONFLICT (order_id) DO NOTHING;

  PERFORM set_config('app.accepting_delivery', '0', true);
END;
$function$;