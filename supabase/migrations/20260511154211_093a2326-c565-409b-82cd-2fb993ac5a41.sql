-- Trigger: when order is marked completed, bump freelancer completed_orders + total_earnings
CREATE OR REPLACE FUNCTION public.handle_order_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    UPDATE public.freelancers
    SET completed_orders = COALESCE(completed_orders, 0) + 1,
        total_earnings   = COALESCE(total_earnings, 0)   + COALESCE(NEW.amount, 0)
    WHERE id = NEW.freelancer_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_completion ON public.orders;
CREATE TRIGGER trg_order_completion
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_order_completion();

-- Trigger: when a gig review is inserted, recompute freelancer overall rating
CREATE OR REPLACE FUNCTION public.handle_gig_review_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_freelancer_id uuid;
  v_avg numeric;
BEGIN
  SELECT freelancer_id INTO v_freelancer_id FROM public.gigs WHERE id = NEW.gig_id;
  IF v_freelancer_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT ROUND(AVG(r.rating)::numeric, 2) INTO v_avg
  FROM public.gig_reviews r
  JOIN public.gigs g ON g.id = r.gig_id
  WHERE g.freelancer_id = v_freelancer_id;

  UPDATE public.freelancers
  SET rating = COALESCE(v_avg, 0)
  WHERE id = v_freelancer_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_gig_review_insert ON public.gig_reviews;
CREATE TRIGGER trg_gig_review_insert
AFTER INSERT ON public.gig_reviews
FOR EACH ROW
EXECUTE FUNCTION public.handle_gig_review_insert();

-- Helper RPC: current user updates their own last_seen heartbeat (works under existing RLS too, but explicit RPC is cheap and reliable)
CREATE OR REPLACE FUNCTION public.touch_last_seen()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.profiles SET last_seen = now() WHERE id = auth.uid();
$$;