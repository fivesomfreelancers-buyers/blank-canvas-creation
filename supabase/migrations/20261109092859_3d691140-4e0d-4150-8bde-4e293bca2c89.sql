DO $$ DECLARE definition text; BEGIN SELECT pg_get_functiondef('public.dispatch_notification_emails()'::regprocedure) INTO definition; definition:=replace(definition,'LIMIT 20 FOR UPDATE','LIMIT 5 FOR UPDATE'); definition:=replace(definition,$old$v_body->>'sent'='true' OR v_body ? 'skipped'$old$,$new$(v_body->>'sent'='true' AND nullif(v_body->>'id','') IS NOT NULL) OR v_body ? 'skipped'$new$); EXECUTE definition; END $$;
CREATE OR REPLACE FUNCTION public.notify_gig_review_email() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE recipient uuid; BEGIN
 IF NEW.action IN ('submitted','resubmitted') THEN
 FOR recipient IN SELECT DISTINCT user_id FROM public.user_roles WHERE role IN ('admin','super_admin','founder') LOOP
 INSERT INTO public.email_notification_outbox(event_key,function_name,payload) VALUES('gig-review/'||NEW.id||'/'||recipient,'send-gig-review-email',jsonb_build_object('history_id',NEW.id,'recipient_id',recipient)) ON CONFLICT(event_key) DO NOTHING;
 END LOOP; END IF; RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.notify_gig_review_email() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.notify_gig_review_email() TO service_role;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='gig_review_notify_email' AND tgrelid='public.gig_review_history'::regclass) THEN CREATE TRIGGER gig_review_notify_email AFTER INSERT ON public.gig_review_history FOR EACH ROW EXECUTE FUNCTION public.notify_gig_review_email(); END IF; END $$;