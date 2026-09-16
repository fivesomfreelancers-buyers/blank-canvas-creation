ALTER TABLE public.blue_tick_applications
  ADD COLUMN IF NOT EXISTS id_type text,
  ADD COLUMN IF NOT EXISTS years_experience text,
  ADD COLUMN IF NOT EXISTS current_step integer NOT NULL DEFAULT 1;

CREATE OR REPLACE FUNCTION public.save_blue_tick_application_draft(
  _experience text DEFAULT NULL::text,
  _specialties text[] DEFAULT '{}'::text[],
  _project_summary text DEFAULT NULL::text,
  _social_links jsonb DEFAULT '{}'::jsonb,
  _id_front_url text DEFAULT NULL::text,
  _id_back_url text DEFAULT NULL::text,
  _selfie_url text DEFAULT NULL::text,
  _id_type text DEFAULT NULL::text,
  _years_experience text DEFAULT NULL::text,
  _current_step integer DEFAULT NULL::integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_freelancer_id uuid;
  v_id uuid;
  v_id_type text := NULLIF(btrim(COALESCE(_id_type, '')), '');
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT id INTO v_freelancer_id FROM public.freelancers WHERE user_id = v_user;
  IF v_freelancer_id IS NULL THEN RAISE EXCEPTION 'Freelancer profile not found'; END IF;
  IF jsonb_typeof(COALESCE(_social_links, '{}'::jsonb)) <> 'object' THEN RAISE EXCEPTION 'Invalid social links'; END IF;
  IF v_id_type IS NOT NULL AND v_id_type NOT IN ('passport', 'national_id', 'driving_licence') THEN
    RAISE EXCEPTION 'Invalid ID type';
  END IF;

  SELECT id INTO v_id FROM public.blue_tick_applications
    WHERE user_id = v_user AND status IN ('draft', 'more_info_requested')
    ORDER BY created_at DESC LIMIT 1;

  IF v_id IS NULL THEN
    INSERT INTO public.blue_tick_applications (
      user_id, freelancer_id, reason, experience, specialties, project_summary,
      social_links, status, identity_verified, liveness_status,
      id_front_url, id_back_url, selfie_url, id_type, years_experience, current_step
    ) VALUES (
      v_user, v_freelancer_id, '', NULLIF(btrim(COALESCE(_experience, '')), ''),
      COALESCE(_specialties, '{}'), NULLIF(btrim(COALESCE(_project_summary, '')), ''),
      COALESCE(_social_links, '{}'::jsonb), 'draft', false, 'not_started',
      NULLIF(btrim(COALESCE(_id_front_url, '')), ''),
      NULLIF(btrim(COALESCE(_id_back_url, '')), ''),
      NULLIF(btrim(COALESCE(_selfie_url, '')), ''),
      v_id_type,
      NULLIF(btrim(COALESCE(_years_experience, '')), ''),
      LEAST(GREATEST(COALESCE(_current_step, 1), 1), 3)
    ) RETURNING id INTO v_id;
  ELSE
    UPDATE public.blue_tick_applications SET
      experience = NULLIF(btrim(COALESCE(_experience, '')), ''),
      specialties = COALESCE(_specialties, '{}'),
      project_summary = NULLIF(btrim(COALESCE(_project_summary, '')), ''),
      social_links = COALESCE(_social_links, '{}'::jsonb),
      id_front_url = COALESCE(NULLIF(btrim(COALESCE(_id_front_url, '')), ''), id_front_url),
      id_back_url = COALESCE(NULLIF(btrim(COALESCE(_id_back_url, '')), ''), id_back_url),
      selfie_url = COALESCE(NULLIF(btrim(COALESCE(_selfie_url, '')), ''), selfie_url),
      id_type = COALESCE(v_id_type, id_type),
      years_experience = COALESCE(NULLIF(btrim(COALESCE(_years_experience, '')), ''), years_experience),
      current_step = LEAST(GREATEST(COALESCE(_current_step, current_step), 1), 3),
      more_info_request = NULL
    WHERE id = v_id;
  END IF;
  RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.submit_blue_tick_application(_application_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_eligibility jsonb;
  v_app public.blue_tick_applications;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT * INTO v_app FROM public.blue_tick_applications
    WHERE id = _application_id AND user_id = v_user AND status IN ('draft', 'more_info_requested')
    FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Application is unavailable'; END IF;

  IF COALESCE(array_length(v_app.specialties, 1), 0) = 0
     OR COALESCE(btrim(v_app.project_summary), '') = ''
     OR COALESCE(btrim(v_app.years_experience), '') = '' THEN
    RAISE EXCEPTION 'Step 1: professional information is incomplete';
  END IF;
  IF COALESCE(v_app.id_type, '') NOT IN ('passport', 'national_id', 'driving_licence')
     OR COALESCE(v_app.id_front_url, '') = '' OR COALESCE(v_app.id_back_url, '') = '' THEN
    RAISE EXCEPTION 'Step 2: ID type and both sides of your ID document are required';
  END IF;
  IF COALESCE(v_app.selfie_url, '') = '' THEN
    RAISE EXCEPTION 'Step 3: face verification is required';
  END IF;

  v_eligibility := public.get_blue_tick_eligibility(v_user);
  IF NOT COALESCE((v_eligibility->>'eligible')::boolean, false) THEN
    RAISE EXCEPTION 'All Blue Tick eligibility requirements must be completed';
  END IF;

  UPDATE public.blue_tick_applications SET
    status = 'pending', submitted_at = now(), identity_verified = true,
    liveness_status = CASE WHEN liveness_status = 'verified' THEN 'verified' ELSE 'pending' END,
    current_step = 3,
    eligibility_snapshot = v_eligibility, rejection_reason = NULL,
    more_info_request = NULL, reviewed_by = NULL, reviewed_at = NULL
  WHERE id = _application_id;

  INSERT INTO public.blue_tick_action_history(application_id, user_id, actor_id, action, metadata)
  VALUES (_application_id, v_user, v_user, 'submitted', jsonb_build_object('eligibility', v_eligibility));
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_blue_tick_eligibility(_user_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    (CASE WHEN v_member_days >= 100 THEN 1 ELSE 0 END) +
    (CASE WHEN v_recent THEN 1 ELSE 0 END) +
    (CASE WHEN v_completed_orders >= 10 THEN 1 ELSE 0 END) +
    (CASE WHEN v_earnings >= 100 THEN 1 ELSE 0 END) +
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
$function$;