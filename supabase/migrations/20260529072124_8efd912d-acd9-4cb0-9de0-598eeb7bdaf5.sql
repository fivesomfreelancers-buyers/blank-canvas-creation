CREATE OR REPLACE FUNCTION public.get_freelancer_gig_limit(_freelancer_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tier public.vip_tier;
  _expires_at timestamptz;
BEGIN
  SELECT vip_tier, vip_expires_at
    INTO _tier, _expires_at
  FROM public.freelancers
  WHERE id = _freelancer_id;

  IF _tier = 'platinum' AND (_expires_at IS NULL OR _expires_at > now()) THEN
    RETURN 3;
  ELSIF _tier = 'golden' AND (_expires_at IS NULL OR _expires_at > now()) THEN
    RETURN 2;
  END IF;

  RETURN 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_freelancer_gig_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _limit integer;
  _active_count integer;
BEGIN
  IF NEW.status IS DISTINCT FROM 'active' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE'
     AND OLD.status = 'active'
     AND OLD.freelancer_id = NEW.freelancer_id THEN
    RETURN NEW;
  END IF;

  _limit := public.get_freelancer_gig_limit(NEW.freelancer_id);

  SELECT count(*)
    INTO _active_count
  FROM public.gigs
  WHERE freelancer_id = NEW.freelancer_id
    AND status = 'active'
    AND id IS DISTINCT FROM NEW.id;

  IF _active_count >= _limit THEN
    RAISE EXCEPTION 'Gig limit reached for this account. Current limit is % active gigs.', _limit;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_freelancer_gig_limit ON public.gigs;
CREATE TRIGGER trg_enforce_freelancer_gig_limit
BEFORE INSERT OR UPDATE OF status, freelancer_id ON public.gigs
FOR EACH ROW
EXECUTE FUNCTION public.enforce_freelancer_gig_limit();