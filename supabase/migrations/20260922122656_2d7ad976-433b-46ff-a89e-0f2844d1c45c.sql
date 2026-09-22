ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_role public.app_role;

CREATE OR REPLACE FUNCTION public.profiles_protect_onboarding_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.onboarding_role IS DISTINCT FROM OLD.onboarding_role
     AND current_setting('fivesom.allow_onboarding_role_change', true) IS DISTINCT FROM 'on' THEN
    NEW.onboarding_role := OLD.onboarding_role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_onboarding_role_trigger ON public.profiles;
CREATE TRIGGER profiles_protect_onboarding_role_trigger
BEFORE UPDATE OF onboarding_role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.profiles_protect_onboarding_role();

CREATE OR REPLACE FUNCTION public.set_onboarding_role(_role public.app_role)
RETURNS public.app_role
LANGUAGE plpgsql
SECURITY DEFINER
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