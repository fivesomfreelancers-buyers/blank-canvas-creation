ALTER TABLE public.buyer_follows ADD COLUMN IF NOT EXISTS notify boolean NOT NULL DEFAULT true;

CREATE OR REPLACE FUNCTION public.buyer_follower_count(_buyer_id uuid)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT count(*)::int FROM public.buyer_follows WHERE buyer_id = _buyer_id $$;
REVOKE EXECUTE ON FUNCTION public.buyer_follower_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.buyer_follower_count(uuid) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.jobs_alert_freelancers()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _u uuid; _buyer text;
BEGIN
  IF NEW.status = 'published' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'published') THEN
    SELECT COALESCE(NULLIF(full_name,''),'A buyer') INTO _buyer FROM public.profiles WHERE id = NEW.buyer_id;
    -- Followers who turned notifications on are alerted first with a personal notice.
    FOR _u IN SELECT bf.follower_id FROM public.buyer_follows bf WHERE bf.buyer_id = NEW.buyer_id AND bf.notify AND bf.follower_id <> NEW.buyer_id LOOP
      PERFORM public.jobs_notify(_u, '🔔 ' || _buyer || ', a buyer you follow, just posted a new job: "' || left(NEW.title,150) || '" — budget ' || NEW.currency || ' ' || NEW.budget_min || '–' || NEW.budget_max || '. Apply first: https://fivesom.net/jobs/' || NEW.id);
    END LOOP;
    FOR _u IN SELECT DISTINCT f.user_id FROM public.freelancers f WHERE f.user_id <> NEW.buyer_id
      AND NOT EXISTS (SELECT 1 FROM public.buyer_follows bf WHERE bf.buyer_id = NEW.buyer_id AND bf.follower_id = f.user_id AND bf.notify) LOOP
      PERFORM public.jobs_notify(_u, 'New job posted on Fivesom: "' || left(NEW.title,150) || '" — budget ' || NEW.currency || ' ' || NEW.budget_min || '–' || NEW.budget_max || '. Apply now: https://fivesom.net/jobs/' || NEW.id);
    END LOOP;
  END IF;
  RETURN NEW;
END $function$;