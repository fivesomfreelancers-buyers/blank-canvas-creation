CREATE OR REPLACE FUNCTION public.get_account_state()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid := auth.uid();
  _active public.app_role;
  _selected public.app_role;
  _email_verified boolean := false;
  _p record;
  _profile_fields_complete boolean := false;
  _onboarding_complete boolean := false;
BEGIN
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('authenticated', false);
  END IF;

  SELECT (u.email_confirmed_at IS NOT NULL)
  INTO _email_verified
  FROM auth.users u
  WHERE u.id = _user_id;

  SELECT ur.role
  INTO _active
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
    AND ur.role IN (
      'buyer'::public.app_role,
      'freelancer'::public.app_role,
      'admin'::public.app_role,
      'super_admin'::public.app_role,
      'founder'::public.app_role
    )
  ORDER BY CASE ur.role
    WHEN 'founder'::public.app_role THEN 1
    WHEN 'super_admin'::public.app_role THEN 2
    WHEN 'admin'::public.app_role THEN 3
    WHEN 'freelancer'::public.app_role THEN 4
    WHEN 'buyer'::public.app_role THEN 5
    ELSE 6
  END
  LIMIT 1;

  SELECT p.onboarding_role, p.full_name, p.location, p.professional_title,
         p.bio, p.industry, p.profile_image_url, p.username, p.email
  INTO _p
  FROM public.profiles p
  WHERE p.id = _user_id;

  _selected := COALESCE(
    CASE
      WHEN _active IN ('buyer'::public.app_role, 'freelancer'::public.app_role)
      THEN _active
    END,
    _p.onboarding_role
  );

  IF _selected = 'freelancer'::public.app_role THEN
    _profile_fields_complete := coalesce(btrim(_p.full_name), '') <> ''
      AND coalesce(btrim(_p.location), '') <> ''
      AND coalesce(btrim(_p.professional_title), '') <> ''
      AND coalesce(btrim(_p.bio), '') <> '';
  ELSIF _selected = 'buyer'::public.app_role THEN
    _profile_fields_complete := coalesce(btrim(_p.full_name), '') <> ''
      AND coalesce(btrim(_p.location), '') <> ''
      AND coalesce(btrim(_p.industry), '') <> '';
  END IF;

  -- Compatibility boundary:
  -- buyer/freelancer roles are granted only after the established onboarding
  -- flow succeeds. Legacy accounts already holding either role must therefore
  -- remain complete even if newer optional/required profile fields are absent.
  -- New accounts hold only the neutral user role until their new onboarding is
  -- completed, so they remain locked by selected onboarding_role as intended.
  _onboarding_complete := _active IN (
    'buyer'::public.app_role,
    'freelancer'::public.app_role
  );

  RETURN jsonb_build_object(
    'authenticated', true,
    'email_verified', coalesce(_email_verified, false),
    'active_role', _active::text,
    'selected_role', _selected::text,
    'onboarding_status', CASE
      WHEN _active IN (
        'admin'::public.app_role,
        'super_admin'::public.app_role,
        'founder'::public.app_role
      ) THEN 'complete'
      WHEN _onboarding_complete THEN 'complete'
      WHEN _selected IS NULL THEN 'role_pending'
      ELSE 'incomplete'
    END,
    'profile_complete', CASE
      WHEN _onboarding_complete THEN true
      ELSE _profile_fields_complete
    END,
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
$function$;

REVOKE ALL ON FUNCTION public.get_account_state() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_account_state() TO authenticated, service_role;