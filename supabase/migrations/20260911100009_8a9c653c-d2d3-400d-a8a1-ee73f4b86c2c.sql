ALTER TABLE public.blue_tick_applications
  ALTER COLUMN reason SET DEFAULT '',
  ADD COLUMN IF NOT EXISTS specialties text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS project_summary text,
  ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS identity_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS liveness_status text NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS persona_inquiry_id text,
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS more_info_request text,
  ADD COLUMN IF NOT EXISTS eligibility_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS blue_tick_persona_inquiry_uidx
  ON public.blue_tick_applications(persona_inquiry_id)
  WHERE persona_inquiry_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS blue_tick_one_open_application_uidx
  ON public.blue_tick_applications(user_id)
  WHERE status IN ('draft', 'pending', 'more_info_requested');
CREATE INDEX IF NOT EXISTS blue_tick_applications_status_created_idx
  ON public.blue_tick_applications(status, created_at DESC);

GRANT SELECT ON public.user_warnings TO authenticated;
GRANT INSERT, UPDATE ON public.user_warnings TO authenticated;
GRANT ALL ON public.user_warnings TO service_role;
ALTER TABLE public.user_warnings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own warnings" ON public.user_warnings;
CREATE POLICY "Users view own warnings"
  ON public.user_warnings FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_user(auth.uid()));
DROP POLICY IF EXISTS "Admins create warnings" ON public.user_warnings;
CREATE POLICY "Admins create warnings"
  ON public.user_warnings FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user(auth.uid()) AND issued_by = auth.uid());
DROP POLICY IF EXISTS "Admins update warnings" ON public.user_warnings;
CREATE POLICY "Admins update warnings"
  ON public.user_warnings FOR UPDATE TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));
DROP TRIGGER IF EXISTS user_warnings_updated_at ON public.user_warnings;
CREATE TRIGGER user_warnings_updated_at
  BEFORE UPDATE ON public.user_warnings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE INDEX IF NOT EXISTS user_warnings_user_active_idx
  ON public.user_warnings(user_id, status, expires_at);

GRANT SELECT ON public.blue_tick_action_history TO authenticated;
GRANT ALL ON public.blue_tick_action_history TO service_role;
ALTER TABLE public.blue_tick_action_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own blue tick history" ON public.blue_tick_action_history;
CREATE POLICY "Users view own blue tick history"
  ON public.blue_tick_action_history FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_user(auth.uid()));
CREATE INDEX IF NOT EXISTS blue_tick_history_user_created_idx
  ON public.blue_tick_action_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS blue_tick_history_application_idx
  ON public.blue_tick_action_history(application_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.get_blue_tick_eligibility(_user_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_freelancer public.freelancers%ROWTYPE;
  v_created_at timestamptz;
  v_last_seen timestamptz;
  v_member_days integer := 0;
  v_completed_orders integer := 0;
  v_earnings numeric := 0;
  v_rating numeric := 0;
  v_review_count integer := 0;
  v_warnings integer := 0;
  v_identity boolean := false;
  v_recent boolean := false;
  v_complete integer := 0;
BEGIN
  IF v_actor IS NULL OR (_user_id <> v_actor AND NOT public.is_admin_user(v_actor)) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO v_freelancer FROM public.freelancers WHERE user_id = _user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Freelancer profile not found'; END IF;

  SELECT COALESCE(member_since, created_at), last_seen
    INTO v_created_at, v_last_seen
    FROM public.profiles WHERE id = _user_id;

  v_member_days := GREATEST(0, floor(extract(epoch FROM (now() - COALESCE(v_created_at, now()))) / 86400)::integer);
  v_recent := v_last_seen IS NOT NULL AND v_last_seen >= now() - interval '30 days';
  v_identity := COALESCE(v_freelancer.is_verified, false) AND EXISTS (
    SELECT 1 FROM public.verification_documents vd
    WHERE vd.user_id = _user_id AND vd.status = 'approved'::public.verification_status
  );

  SELECT count(*)::integer, COALESCE(sum(COALESCE(o.freelancer_earnings, GREATEST(o.amount - COALESCE(o.buyer_service_fee, 0), 0))), 0)
    INTO v_completed_orders, v_earnings
    FROM public.orders o
    WHERE o.freelancer_id = v_freelancer.id AND o.status = 'completed'::public.order_status;

  SELECT count(gr.id)::integer, COALESCE(avg(gr.rating), 0)
    INTO v_review_count, v_rating
    FROM public.gig_reviews gr
    JOIN public.gigs g ON g.id = gr.gig_id
    WHERE g.freelancer_id = v_freelancer.id;

  SELECT count(*)::integer INTO v_warnings
    FROM public.user_warnings w
    WHERE w.user_id = _user_id
      AND w.status = 'active'
      AND (w.expires_at IS NULL OR w.expires_at > now());

  v_complete :=
    (CASE WHEN v_identity THEN 1 ELSE 0 END) +
    (CASE WHEN v_member_days >= 40 THEN 1 ELSE 0 END) +
    (CASE WHEN v_recent THEN 1 ELSE 0 END) +
    (CASE WHEN v_completed_orders >= 10 THEN 1 ELSE 0 END) +
    (CASE WHEN v_earnings >= 50 THEN 1 ELSE 0 END) +
    (CASE WHEN v_rating >= 4.5 THEN 1 ELSE 0 END) +
    (CASE WHEN v_warnings <= 3 THEN 1 ELSE 0 END);

  RETURN jsonb_build_object(
    'user_id', _user_id,
    'freelancer_id', v_freelancer.id,
    'identity_verified', v_identity,
    'member_days', v_member_days,
    'recent_activity', v_recent,
    'last_seen', v_last_seen,
    'completed_orders', v_completed_orders,
    'earnings', round(v_earnings, 2),
    'rating', round(v_rating, 2),
    'review_count', v_review_count,
    'active_warnings', v_warnings,
    'requirements_complete', v_complete,
    'requirements_total', 7,
    'eligible', v_complete = 7,
    'has_blue_tick', COALESCE(v_freelancer.has_blue_tick, false),
    'calculated_at', now()
  );
END;
$$;
REVOKE ALL ON FUNCTION public.get_blue_tick_eligibility(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_blue_tick_eligibility(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.save_blue_tick_application_draft(
  _experience text DEFAULT NULL,
  _specialties text[] DEFAULT '{}',
  _project_summary text DEFAULT NULL,
  _social_links jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_freelancer_id uuid;
  v_id uuid;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT id INTO v_freelancer_id FROM public.freelancers WHERE user_id = v_user;
  IF v_freelancer_id IS NULL THEN RAISE EXCEPTION 'Freelancer profile not found'; END IF;
  IF jsonb_typeof(COALESCE(_social_links, '{}'::jsonb)) <> 'object' THEN RAISE EXCEPTION 'Invalid social links'; END IF;

  SELECT id INTO v_id FROM public.blue_tick_applications
    WHERE user_id = v_user AND status IN ('draft', 'more_info_requested')
    ORDER BY created_at DESC LIMIT 1;

  IF v_id IS NULL THEN
    INSERT INTO public.blue_tick_applications (
      user_id, freelancer_id, reason, experience, specialties, project_summary,
      social_links, status, identity_verified, liveness_status
    ) VALUES (
      v_user, v_freelancer_id, '', NULLIF(btrim(COALESCE(_experience, '')), ''),
      COALESCE(_specialties, '{}'), NULLIF(btrim(COALESCE(_project_summary, '')), ''),
      COALESCE(_social_links, '{}'::jsonb), 'draft', false, 'not_started'
    ) RETURNING id INTO v_id;
  ELSE
    UPDATE public.blue_tick_applications SET
      experience = NULLIF(btrim(COALESCE(_experience, '')), ''),
      specialties = COALESCE(_specialties, '{}'),
      project_summary = NULLIF(btrim(COALESCE(_project_summary, '')), ''),
      social_links = COALESCE(_social_links, '{}'::jsonb),
      more_info_request = NULL
    WHERE id = v_id;
  END IF;
  RETURN v_id;
END;
$$;
REVOKE ALL ON FUNCTION public.save_blue_tick_application_draft(text, text[], text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_blue_tick_application_draft(text, text[], text, jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_blue_tick_application(_application_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_eligibility jsonb;
  v_liveness text;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT liveness_status INTO v_liveness FROM public.blue_tick_applications
    WHERE id = _application_id AND user_id = v_user AND status IN ('draft', 'more_info_requested')
    FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Application is unavailable'; END IF;
  IF v_liveness <> 'verified' THEN RAISE EXCEPTION 'Face verification must be completed'; END IF;

  v_eligibility := public.get_blue_tick_eligibility(v_user);
  IF NOT COALESCE((v_eligibility->>'eligible')::boolean, false) THEN
    RAISE EXCEPTION 'All Blue Tick eligibility requirements must be completed';
  END IF;

  UPDATE public.blue_tick_applications SET
    status = 'pending', submitted_at = now(), identity_verified = true,
    eligibility_snapshot = v_eligibility, rejection_reason = NULL,
    more_info_request = NULL, reviewed_by = NULL, reviewed_at = NULL
  WHERE id = _application_id;

  INSERT INTO public.blue_tick_action_history(application_id, user_id, actor_id, action, metadata)
  VALUES (_application_id, v_user, v_user, 'submitted', jsonb_build_object('eligibility', v_eligibility));
END;
$$;
REVOKE ALL ON FUNCTION public.submit_blue_tick_application(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_blue_tick_application(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_grant_blue_tick(_user_id uuid, _application_id uuid DEFAULT NULL, _notes text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor uuid := auth.uid(); v_eligibility jsonb;
BEGIN
  IF NOT public.is_admin_user(v_actor) THEN RAISE EXCEPTION 'Only admins or founders can grant Blue Tick'; END IF;
  IF _application_id IS NULL THEN RAISE EXCEPTION 'Application is required'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.blue_tick_applications WHERE id=_application_id AND user_id=_user_id AND status='pending' AND liveness_status='verified') THEN
    RAISE EXCEPTION 'A pending application with verified liveness is required';
  END IF;
  v_eligibility := public.get_blue_tick_eligibility(_user_id);
  IF NOT COALESCE((v_eligibility->>'eligible')::boolean, false) THEN RAISE EXCEPTION 'Applicant is no longer eligible'; END IF;

  UPDATE public.freelancers SET has_blue_tick=true, blue_tick_granted_at=now(), blue_tick_removed_at=NULL, blue_tick_removed_reason=NULL WHERE user_id=_user_id;
  UPDATE public.blue_tick_applications SET status='approved', reviewed_by=v_actor, reviewed_at=now(), admin_notes=NULLIF(btrim(COALESCE(_notes,'')),'') WHERE id=_application_id;
  INSERT INTO public.blue_tick_action_history(application_id,user_id,actor_id,action,reason,metadata)
  VALUES(_application_id,_user_id,v_actor,'approved',NULLIF(btrim(COALESCE(_notes,'')),''),jsonb_build_object('eligibility',v_eligibility));
  INSERT INTO public.admin_action_logs(admin_id,action,target_table,target_id,metadata)
  VALUES(v_actor,'Approved Blue Tick application','blue_tick_applications',_application_id::text,jsonb_build_object('user_id',_user_id,'notes',_notes));
END $$;

CREATE OR REPLACE FUNCTION public.admin_reject_blue_tick(_application_id uuid, _notes text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor uuid := auth.uid(); v_user uuid; v_reason text := btrim(COALESCE(_notes,''));
BEGIN
  IF NOT public.is_admin_user(v_actor) THEN RAISE EXCEPTION 'Only admins or founders can reject Blue Tick'; END IF;
  IF length(v_reason) < 3 THEN RAISE EXCEPTION 'A rejection reason is required'; END IF;
  SELECT user_id INTO v_user FROM public.blue_tick_applications WHERE id=_application_id AND status IN ('pending','more_info_requested') FOR UPDATE;
  IF v_user IS NULL THEN RAISE EXCEPTION 'Application is unavailable'; END IF;
  UPDATE public.blue_tick_applications SET status='rejected', reviewed_by=v_actor, reviewed_at=now(), admin_notes=v_reason, rejection_reason=v_reason WHERE id=_application_id;
  INSERT INTO public.blue_tick_action_history(application_id,user_id,actor_id,action,reason) VALUES(_application_id,v_user,v_actor,'rejected',v_reason);
  INSERT INTO public.admin_action_logs(admin_id,action,target_table,target_id,metadata) VALUES(v_actor,'Rejected Blue Tick application','blue_tick_applications',_application_id::text,jsonb_build_object('user_id',v_user,'reason',v_reason));
END $$;

CREATE OR REPLACE FUNCTION public.admin_request_blue_tick_info(_application_id uuid, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor uuid := auth.uid(); v_user uuid; v_reason text := btrim(COALESCE(_reason,''));
BEGIN
  IF NOT public.is_admin_user(v_actor) THEN RAISE EXCEPTION 'Only admins or founders can request information'; END IF;
  IF length(v_reason) < 3 THEN RAISE EXCEPTION 'A reason is required'; END IF;
  SELECT user_id INTO v_user FROM public.blue_tick_applications WHERE id=_application_id AND status='pending' FOR UPDATE;
  IF v_user IS NULL THEN RAISE EXCEPTION 'Pending application not found'; END IF;
  UPDATE public.blue_tick_applications SET status='more_info_requested', reviewed_by=v_actor, reviewed_at=now(), more_info_request=v_reason, admin_notes=v_reason WHERE id=_application_id;
  INSERT INTO public.blue_tick_action_history(application_id,user_id,actor_id,action,reason) VALUES(_application_id,v_user,v_actor,'more_info_requested',v_reason);
  INSERT INTO public.admin_action_logs(admin_id,action,target_table,target_id,metadata) VALUES(v_actor,'Requested Blue Tick information','blue_tick_applications',_application_id::text,jsonb_build_object('user_id',v_user,'reason',v_reason));
END $$;

CREATE OR REPLACE FUNCTION public.admin_revoke_blue_tick(_user_id uuid, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor uuid := auth.uid(); v_reason text := btrim(COALESCE(_reason,'')); v_app uuid;
BEGIN
  IF NOT public.is_admin_user(v_actor) THEN RAISE EXCEPTION 'Only admins or founders can revoke Blue Tick'; END IF;
  IF length(v_reason) < 3 THEN RAISE EXCEPTION 'A removal reason is required'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.freelancers WHERE user_id=_user_id AND has_blue_tick=true) THEN RAISE EXCEPTION 'User does not have an active Blue Tick'; END IF;
  SELECT id INTO v_app FROM public.blue_tick_applications WHERE user_id=_user_id AND status='approved' ORDER BY reviewed_at DESC NULLS LAST LIMIT 1;
  UPDATE public.freelancers SET has_blue_tick=false, blue_tick_removed_at=now(), blue_tick_removed_reason=v_reason WHERE user_id=_user_id;
  INSERT INTO public.blue_tick_action_history(application_id,user_id,actor_id,action,reason) VALUES(v_app,_user_id,v_actor,'revoked',v_reason);
  INSERT INTO public.admin_action_logs(admin_id,action,target_table,target_id,metadata) VALUES(v_actor,'Removed Blue Tick','freelancers',_user_id::text,jsonb_build_object('reason',v_reason));
END $$;

CREATE OR REPLACE FUNCTION public.admin_issue_user_warning(_user_id uuid, _reason text, _severity text DEFAULT 'warning', _expires_at timestamptz DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor uuid := auth.uid(); v_id uuid; v_reason text := btrim(COALESCE(_reason,''));
BEGIN
  IF NOT public.is_admin_user(v_actor) THEN RAISE EXCEPTION 'Only admins or founders can issue warnings'; END IF;
  IF length(v_reason) < 3 THEN RAISE EXCEPTION 'A warning reason is required'; END IF;
  INSERT INTO public.user_warnings(user_id,reason,severity,issued_by,expires_at) VALUES(_user_id,v_reason,COALESCE(NULLIF(btrim(_severity),''),'warning'),v_actor,_expires_at) RETURNING id INTO v_id;
  INSERT INTO public.blue_tick_action_history(user_id,actor_id,action,reason,metadata) VALUES(_user_id,v_actor,'warning_issued',v_reason,jsonb_build_object('warning_id',v_id,'severity',_severity,'expires_at',_expires_at));
  INSERT INTO public.admin_action_logs(admin_id,action,target_table,target_id,metadata) VALUES(v_actor,'Issued user warning','user_warnings',v_id::text,jsonb_build_object('user_id',_user_id,'reason',v_reason));
  RETURN v_id;
END $$;

CREATE OR REPLACE FUNCTION public.admin_remove_user_warning(_warning_id uuid, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor uuid := auth.uid(); v_user uuid; v_reason text := btrim(COALESCE(_reason,''));
BEGIN
  IF NOT public.is_admin_user(v_actor) THEN RAISE EXCEPTION 'Only admins or founders can remove warnings'; END IF;
  IF length(v_reason) < 3 THEN RAISE EXCEPTION 'A removal reason is required'; END IF;
  UPDATE public.user_warnings SET status='removed',removed_at=now(),removed_by=v_actor,removal_reason=v_reason WHERE id=_warning_id AND status='active' RETURNING user_id INTO v_user;
  IF v_user IS NULL THEN RAISE EXCEPTION 'Active warning not found'; END IF;
  INSERT INTO public.blue_tick_action_history(user_id,actor_id,action,reason,metadata) VALUES(v_user,v_actor,'warning_removed',v_reason,jsonb_build_object('warning_id',_warning_id));
  INSERT INTO public.admin_action_logs(admin_id,action,target_table,target_id,metadata) VALUES(v_actor,'Removed user warning','user_warnings',_warning_id::text,jsonb_build_object('user_id',v_user,'reason',v_reason));
END $$;

REVOKE ALL ON FUNCTION public.admin_grant_blue_tick(uuid,uuid,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_reject_blue_tick(uuid,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_revoke_blue_tick(uuid,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_request_blue_tick_info(uuid,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_issue_user_warning(uuid,text,text,timestamptz) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_remove_user_warning(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_grant_blue_tick(uuid,uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reject_blue_tick(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_revoke_blue_tick(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_request_blue_tick_info(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_issue_user_warning(uuid,text,text,timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_remove_user_warning(uuid,text) TO authenticated;

DROP POLICY IF EXISTS "Users create own blue tick applications" ON public.blue_tick_applications;
DROP POLICY IF EXISTS "Admins update blue tick applications" ON public.blue_tick_applications;
REVOKE INSERT, UPDATE, DELETE ON public.blue_tick_applications FROM authenticated;
GRANT SELECT ON public.blue_tick_applications TO authenticated;
GRANT ALL ON public.blue_tick_applications TO service_role;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.blue_tick_applications;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.user_warnings;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.blue_tick_action_history;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.freelancers;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.gig_reviews;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.verification_documents;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;