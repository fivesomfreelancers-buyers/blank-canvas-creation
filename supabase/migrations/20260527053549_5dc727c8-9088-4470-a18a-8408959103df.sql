
DROP POLICY IF EXISTS "Users view own blue tick applications" ON public.blue_tick_applications;
DROP POLICY IF EXISTS "Users create own blue tick applications" ON public.blue_tick_applications;
DROP POLICY IF EXISTS "Admins update blue tick applications" ON public.blue_tick_applications;

CREATE POLICY "Users view own blue tick applications"
ON public.blue_tick_applications FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin_user(auth.uid()));

CREATE POLICY "Users create own blue tick applications"
ON public.blue_tick_applications FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins update blue tick applications"
ON public.blue_tick_applications FOR UPDATE TO authenticated
USING (public.is_admin_user(auth.uid()))
WITH CHECK (public.is_admin_user(auth.uid()));

DROP TRIGGER IF EXISTS trg_btapp_updated_at ON public.blue_tick_applications;
CREATE TRIGGER trg_btapp_updated_at
BEFORE UPDATE ON public.blue_tick_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE FUNCTION public.admin_grant_blue_tick(_user_id uuid, _application_id uuid DEFAULT NULL, _notes text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin_user(auth.uid()) THEN RAISE EXCEPTION 'Only admins can grant blue tick'; END IF;
  UPDATE public.freelancers
    SET has_blue_tick = true, blue_tick_granted_at = now(),
        blue_tick_removed_at = NULL, blue_tick_removed_reason = NULL
    WHERE user_id = _user_id;
  IF _application_id IS NOT NULL THEN
    UPDATE public.blue_tick_applications
      SET status = 'approved', reviewed_by = auth.uid(), reviewed_at = now(), admin_notes = COALESCE(_notes, admin_notes)
      WHERE id = _application_id;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.admin_revoke_blue_tick(_user_id uuid, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin_user(auth.uid()) THEN RAISE EXCEPTION 'Only admins can revoke blue tick'; END IF;
  UPDATE public.freelancers
    SET has_blue_tick = false, blue_tick_removed_at = now(), blue_tick_removed_reason = _reason
    WHERE user_id = _user_id;
END $$;

CREATE OR REPLACE FUNCTION public.admin_reject_blue_tick(_application_id uuid, _notes text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin_user(auth.uid()) THEN RAISE EXCEPTION 'Only admins can reject blue tick'; END IF;
  UPDATE public.blue_tick_applications
    SET status = 'rejected', reviewed_by = auth.uid(), reviewed_at = now(), admin_notes = _notes
    WHERE id = _application_id;
END $$;
