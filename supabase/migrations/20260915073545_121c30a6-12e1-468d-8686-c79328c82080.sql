ALTER TABLE public.blue_tick_applications
  ADD COLUMN IF NOT EXISTS id_front_url text,
  ADD COLUMN IF NOT EXISTS id_back_url text,
  ADD COLUMN IF NOT EXISTS selfie_url text;

CREATE OR REPLACE FUNCTION public.save_blue_tick_application_draft(
  _experience text DEFAULT NULL::text,
  _specialties text[] DEFAULT '{}'::text[],
  _project_summary text DEFAULT NULL::text,
  _social_links jsonb DEFAULT '{}'::jsonb,
  _id_front_url text DEFAULT NULL::text,
  _id_back_url text DEFAULT NULL::text,
  _selfie_url text DEFAULT NULL::text
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
      social_links, status, identity_verified, liveness_status,
      id_front_url, id_back_url, selfie_url
    ) VALUES (
      v_user, v_freelancer_id, '', NULLIF(btrim(COALESCE(_experience, '')), ''),
      COALESCE(_specialties, '{}'), NULLIF(btrim(COALESCE(_project_summary, '')), ''),
      COALESCE(_social_links, '{}'::jsonb), 'draft', false, 'not_started',
      NULLIF(btrim(COALESCE(_id_front_url, '')), ''),
      NULLIF(btrim(COALESCE(_id_back_url, '')), ''),
      NULLIF(btrim(COALESCE(_selfie_url, '')), '')
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
     OR COALESCE(btrim(v_app.project_summary), '') = '' THEN
    RAISE EXCEPTION 'Step 1: professional information is incomplete';
  END IF;
  IF COALESCE(v_app.id_front_url, '') = '' OR COALESCE(v_app.id_back_url, '') = '' THEN
    RAISE EXCEPTION 'Step 2: both sides of your ID document are required';
  END IF;
  IF COALESCE(v_app.selfie_url, '') = '' THEN
    RAISE EXCEPTION 'Step 3: face verification photo is required';
  END IF;

  v_eligibility := public.get_blue_tick_eligibility(v_user);
  IF NOT COALESCE((v_eligibility->>'eligible')::boolean, false) THEN
    RAISE EXCEPTION 'All Blue Tick eligibility requirements must be completed';
  END IF;

  UPDATE public.blue_tick_applications SET
    status = 'pending', submitted_at = now(), identity_verified = true,
    liveness_status = 'verified',
    eligibility_snapshot = v_eligibility, rejection_reason = NULL,
    more_info_request = NULL, reviewed_by = NULL, reviewed_at = NULL
  WHERE id = _application_id;

  INSERT INTO public.blue_tick_action_history(application_id, user_id, actor_id, action, metadata)
  VALUES (_application_id, v_user, v_user, 'submitted', jsonb_build_object('eligibility', v_eligibility));
END;
$function$;