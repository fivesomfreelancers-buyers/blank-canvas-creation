-- Reliable, self-contained storage of the first Buyer/Freelancer choice.
CREATE OR REPLACE FUNCTION public.set_onboarding_role(_role text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _wanted public.app_role;
  _current public.app_role;
  _active public.app_role;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF lower(coalesce(_role, '')) NOT IN ('buyer', 'freelancer') THEN
    RAISE EXCEPTION 'Account type must be buyer or freelancer';
  END IF;
  _wanted := lower(_role)::public.app_role;

  SELECT ur.role INTO _active
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
    AND ur.role IN ('buyer'::public.app_role, 'freelancer'::public.app_role,
                    'admin'::public.app_role, 'super_admin'::public.app_role, 'founder'::public.app_role)
  LIMIT 1;

  IF _active IS NOT NULL THEN
    RETURN _active::text;
  END IF;

  SELECT p.onboarding_role INTO _current
  FROM public.profiles p
  WHERE p.id = _user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, onboarding_role)
    VALUES (_user_id, _wanted)
    ON CONFLICT (id) DO NOTHING;
    RETURN _wanted::text;
  END IF;

  IF _current IS NOT NULL THEN
    RETURN _current::text;
  END IF;

  PERFORM set_config('fivesom.allow_onboarding_role_change', 'on', true);
  UPDATE public.profiles
  SET onboarding_role = _wanted,
      updated_at = now()
  WHERE id = _user_id;

  RETURN _wanted::text;
END;
$$;

REVOKE ALL ON FUNCTION public.set_onboarding_role(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_onboarding_role(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_onboarding_role(text) TO service_role;

DROP FUNCTION IF EXISTS public.set_onboarding_role(public.app_role);

-- Single authoritative answer to "where does this account belong right now?".
CREATE OR REPLACE FUNCTION public.get_account_state()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _active public.app_role;
  _selected public.app_role;
  _email_verified boolean := false;
  _p record;
  _complete boolean := false;
BEGIN
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('authenticated', false);
  END IF;

  SELECT (u.email_confirmed_at IS NOT NULL) INTO _email_verified
  FROM auth.users u WHERE u.id = _user_id;

  SELECT ur.role INTO _active
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
    AND ur.role IN ('buyer'::public.app_role, 'freelancer'::public.app_role,
                    'admin'::public.app_role, 'super_admin'::public.app_role, 'founder'::public.app_role)
  ORDER BY CASE ur.role
    WHEN 'founder'::public.app_role THEN 1
    WHEN 'super_admin'::public.app_role THEN 2
    WHEN 'admin'::public.app_role THEN 3
    ELSE 4 END
  LIMIT 1;

  SELECT p.onboarding_role, p.full_name, p.location, p.professional_title, p.bio, p.industry,
         p.profile_image_url, p.username, p.email
  INTO _p
  FROM public.profiles p WHERE p.id = _user_id;

  _selected := COALESCE(
    CASE WHEN _active IN ('buyer'::public.app_role, 'freelancer'::public.app_role) THEN _active END,
    _p.onboarding_role
  );

  IF _selected = 'freelancer'::public.app_role THEN
    _complete := coalesce(btrim(_p.full_name), '') <> ''
             AND coalesce(btrim(_p.location), '') <> ''
             AND coalesce(btrim(_p.professional_title), '') <> ''
             AND coalesce(btrim(_p.bio), '') <> '';
  ELSIF _selected = 'buyer'::public.app_role THEN
    _complete := coalesce(btrim(_p.full_name), '') <> ''
             AND coalesce(btrim(_p.location), '') <> ''
             AND coalesce(btrim(_p.industry), '') <> '';
  END IF;

  RETURN jsonb_build_object(
    'authenticated', true,
    'email_verified', coalesce(_email_verified, false),
    'active_role', _active::text,
    'selected_role', _selected::text,
    'onboarding_status', CASE
      WHEN _selected IS NULL THEN 'role_pending'
      WHEN _active IN ('buyer'::public.app_role, 'freelancer'::public.app_role) AND _complete THEN 'complete'
      ELSE 'incomplete' END,
    'profile_complete', _complete,
    'profile', jsonb_build_object(
      'full_name', _p.full_name,
      'location', _p.location,
      'professional_title', _p.professional_title,
      'bio', _p.bio,
      'industry', _p.industry,
      'profile_image_url', _p.profile_image_url,
      'username', _p.username,
      'email', _p.email
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_account_state() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_account_state() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_account_state() TO service_role;