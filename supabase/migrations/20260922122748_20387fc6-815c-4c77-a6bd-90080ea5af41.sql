CREATE OR REPLACE FUNCTION public.set_onboarding_role(_role public.app_role)
RETURNS public.app_role
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _current public.app_role;
  _effective public.app_role;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF _role NOT IN ('buyer'::public.app_role, 'freelancer'::public.app_role) THEN
    RAISE EXCEPTION 'Onboarding role must be buyer or freelancer';
  END IF;

  SELECT public.effective_user_role(_user_id) INTO _effective;
  IF _effective IN ('buyer'::public.app_role, 'freelancer'::public.app_role, 'admin'::public.app_role, 'super_admin'::public.app_role, 'founder'::public.app_role) THEN
    RAISE EXCEPTION 'Account already has an active role';
  END IF;

  SELECT onboarding_role INTO _current
  FROM public.profiles
  WHERE id = _user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF _current IS NOT NULL AND _current IS DISTINCT FROM _role THEN
    RAISE EXCEPTION 'Onboarding role has already been selected';
  END IF;

  IF _current IS NULL THEN
    PERFORM set_config('fivesom.allow_onboarding_role_change', 'on', true);
    UPDATE public.profiles
    SET onboarding_role = _role,
        updated_at = now()
    WHERE id = _user_id;
  END IF;

  RETURN COALESCE(_current, _role);
END;
$$;

REVOKE ALL ON FUNCTION public.set_onboarding_role(public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_onboarding_role(public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.set_onboarding_role(public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_onboarding_role(public.app_role) TO service_role;