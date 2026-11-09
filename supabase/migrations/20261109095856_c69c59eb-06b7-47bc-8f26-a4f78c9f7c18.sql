CREATE OR REPLACE FUNCTION public.jobs_alert_freelancers()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _u uuid;
BEGIN
  IF NEW.status = 'published' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'published') THEN
    FOR _u IN SELECT DISTINCT f.user_id FROM public.freelancers f WHERE f.user_id <> NEW.buyer_id LOOP
      PERFORM public.jobs_notify(_u, 'New job posted on Fivesom: "' || left(NEW.title,150) || '" — budget ' || NEW.currency || ' ' || NEW.budget_min || '–' || NEW.budget_max || '. Apply now: https://fivesom.net/jobs/' || NEW.id);
    END LOOP;
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.jobs_alert_freelancers() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS jobs_alert_freelancers_trg ON public.jobs;
CREATE TRIGGER jobs_alert_freelancers_trg AFTER INSERT OR UPDATE OF status ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.jobs_alert_freelancers();