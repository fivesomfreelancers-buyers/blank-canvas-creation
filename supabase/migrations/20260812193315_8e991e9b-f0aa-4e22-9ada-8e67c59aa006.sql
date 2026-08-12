-- Verified-paid + requirements-submitted gate for freelancer visibility
CREATE OR REPLACE FUNCTION public.order_is_freelancer_visible(_order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = _order_id
      AND lower(coalesce(o.payment_status, '')) IN ('paid', 'released', 'escrow', 'refunded', 'completed')
      AND EXISTS (SELECT 1 FROM public.order_requirements r WHERE r.order_id = o.id)
  )
$$;

REVOKE ALL ON FUNCTION public.order_is_freelancer_visible(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.order_is_freelancer_visible(uuid) TO authenticated, service_role;

-- Split the shared participant SELECT policy: buyers keep full visibility,
-- freelancers only see genuinely paid orders that have requirements submitted.
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Freelancers can view paid ready orders" ON public.orders;

CREATE POLICY "Buyers can view own orders"
ON public.orders FOR SELECT
USING (auth.uid() = buyer_id);

CREATE POLICY "Freelancers can view paid ready orders"
ON public.orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.freelancers f
    WHERE f.id = orders.freelancer_id AND f.user_id = auth.uid()
  )
  AND public.order_is_freelancer_visible(orders.id)
);

-- Freelancers may only update orders they are allowed to see.
DROP POLICY IF EXISTS "Participants can update order progress" ON public.orders;
CREATE POLICY "Participants can update order progress"
ON public.orders FOR UPDATE
TO authenticated
USING (
  auth.uid() = buyer_id
  OR (
    EXISTS (SELECT 1 FROM public.freelancers f WHERE f.id = orders.freelancer_id AND f.user_id = auth.uid())
    AND public.order_is_freelancer_visible(orders.id)
  )
)
WITH CHECK (
  (
    auth.uid() = buyer_id
    OR EXISTS (SELECT 1 FROM public.freelancers f WHERE f.id = orders.freelancer_id AND f.user_id = auth.uid())
  )
  AND status <> 'completed'::order_status
);

-- Deliveries follow the same gate for freelancers.
CREATE OR REPLACE FUNCTION public.orders_guard_client_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Edge functions (service_role, no auth.uid) and admins are trusted.
  IF auth.uid() IS NULL OR public.is_admin_user(auth.uid()) THEN
    RETURN NEW;
  END IF;

  IF NEW.buyer_id <> auth.uid() THEN
    RAISE EXCEPTION 'You can only create orders for yourself';
  END IF;

  -- Client-created orders are always unverified manual payments.
  NEW.status := 'pending'::public.order_status;
  NEW.payment_status := 'pending_verification';
  NEW.payout_mode := 'wallet';
  NEW.stripe_session_id := NULL;
  NEW.stripe_payment_intent_id := NULL;

  IF COALESCE(NEW.payment_method, '') = '' OR lower(NEW.payment_method) IN ('card', 'stripe') THEN
    RAISE EXCEPTION 'Card payments must go through the secure Stripe checkout';
  END IF;

  RETURN NEW;
END;
$$;