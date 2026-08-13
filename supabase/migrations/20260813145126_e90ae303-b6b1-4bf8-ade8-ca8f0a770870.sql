CREATE OR REPLACE FUNCTION public.enforce_portfolio_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_verified boolean;
  v_count integer;
BEGIN
  SELECT is_verified INTO v_verified FROM public.freelancers WHERE id = NEW.freelancer_id;
  IF COALESCE(v_verified, false) = false AND NOT public.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'Portfolio uploads require account verification';
  END IF;

  IF NEW.media_type = 'video' THEN
    SELECT count(*) INTO v_count FROM public.freelancer_portfolio
      WHERE freelancer_id = NEW.freelancer_id AND media_type = 'video';
    IF v_count >= 1 THEN
      RAISE EXCEPTION 'Maximum of 1 portfolio video allowed';
    END IF;
  ELSE
    SELECT count(*) INTO v_count FROM public.freelancer_portfolio
      WHERE freelancer_id = NEW.freelancer_id AND media_type <> 'video';
    IF v_count >= 3 THEN
      RAISE EXCEPTION 'Maximum of 3 portfolio images allowed';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_portfolio_limits_trg ON public.freelancer_portfolio;
CREATE TRIGGER enforce_portfolio_limits_trg
BEFORE INSERT ON public.freelancer_portfolio
FOR EACH ROW EXECUTE FUNCTION public.enforce_portfolio_limits();