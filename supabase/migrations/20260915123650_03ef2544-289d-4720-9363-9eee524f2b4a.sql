-- 1. Lock financial columns on participant updates
CREATE OR REPLACE FUNCTION public.orders_guard_participant_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR public.is_admin_user(auth.uid())
     OR COALESCE(current_setting('app.accepting_delivery', true), '') = '1' THEN
    RETURN NEW;
  END IF;

  NEW.amount            := OLD.amount;
  NEW.buyer_service_fee := OLD.buyer_service_fee;
  NEW.payment_status    := OLD.payment_status;
  NEW.payment_method    := OLD.payment_method;
  NEW.payout_mode       := OLD.payout_mode;
  NEW.buyer_id          := OLD.buyer_id;
  NEW.freelancer_id     := OLD.freelancer_id;
  NEW.gig_id            := OLD.gig_id;
  NEW.package_name      := OLD.package_name;
  NEW.stripe_session_id := OLD.stripe_session_id;
  NEW.stripe_payment_intent_id := OLD.stripe_payment_intent_id;

  IF NEW.status = 'completed'::public.order_status
     AND OLD.status IS DISTINCT FROM 'completed'::public.order_status THEN
    RAISE EXCEPTION 'Orders can only be completed through accept_order_delivery';
  END IF;

  RETURN NEW;
END;
$function$;

-- 2. Server-side service fee: always $1 for gig orders, never negative or above the total
CREATE OR REPLACE FUNCTION public.orders_set_service_fee()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE _price numeric;
BEGIN
  IF NEW.gig_id IS NOT NULL THEN
    SELECT p.price INTO _price
    FROM public.gig_packages p
    WHERE p.gig_id = NEW.gig_id
      AND NEW.package_name IS NOT NULL
      AND lower(p.name) = lower(NEW.package_name)
    ORDER BY p.price
    LIMIT 1;

    IF _price IS NULL THEN
      SELECT g.base_price INTO _price FROM public.gigs g WHERE g.id = NEW.gig_id;
    END IF;

    IF _price IS NOT NULL AND ROUND(COALESCE(NEW.amount,0),2) = ROUND(_price + 1, 2) THEN
      NEW.buyer_service_fee := 1;
    END IF;
  END IF;

  -- Never trust a client-supplied fee outside sane bounds.
  NEW.buyer_service_fee := LEAST(
    GREATEST(COALESCE(NEW.buyer_service_fee, 0), 0),
    GREATEST(COALESCE(NEW.amount, 0), 0)
  );

  RETURN NEW;
END;
$function$;

-- 3. Only the secure accept-delivery routine may create acceptance records
DROP POLICY IF EXISTS "Buyers can accept deliveries" ON public.accepted_deliveries;
