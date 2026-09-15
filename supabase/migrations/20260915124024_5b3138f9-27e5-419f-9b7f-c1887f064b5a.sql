CREATE OR REPLACE FUNCTION public.enforce_vip_gig_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _tier vip_tier;
  _exp timestamptz;
  _limit int;
  _count int;
BEGIN
  IF NEW.is_vip = false OR NEW.is_vip IS NULL THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.is_vip = true AND NEW.is_vip = true AND OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  SELECT vip_tier, vip_expires_at INTO _tier, _exp
  FROM public.freelancers WHERE id = NEW.freelancer_id;

  IF _tier IS NULL OR _exp IS NULL OR _exp < now() THEN
    RAISE EXCEPTION 'Only active VIP members can create VIP gigs';
  END IF;

  _limit := CASE WHEN _tier = 'platinum'::vip_tier THEN 3 ELSE 2 END;

  SELECT COUNT(*) INTO _count FROM public.gigs
  WHERE freelancer_id = NEW.freelancer_id
    AND is_vip = true
    AND status = 'active'
    AND id <> NEW.id;

  IF _count >= _limit THEN
    RAISE EXCEPTION 'VIP gig limit reached (max % gigs)', _limit;
  END IF;

  RETURN NEW;
END
$function$;