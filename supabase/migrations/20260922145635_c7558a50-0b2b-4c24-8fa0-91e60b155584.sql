CREATE OR REPLACE FUNCTION public.complete_role_onboarding(
  _role text,
  _full_name text,
  _country text,
  _languages text[] DEFAULT '{}',
  _profile_image_url text DEFAULT NULL,
  _professional_title text DEFAULT NULL,
  _bio text DEFAULT NULL,
  _primary_skill text DEFAULT NULL,
  _industry text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid := auth.uid();
  _target public.app_role;
  _email_verified boolean := false;
  _existing public.app_role;
  _langs text[];
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to finish setup.';
  END IF;

  IF _role NOT IN ('buyer', 'freelancer') THEN
    RAISE EXCEPTION 'Invalid account type.';
  END IF;
  _target := _role::public.app_role;

  SELECT (u.email_confirmed_at IS NOT NULL) INTO _email_verified
  FROM auth.users u WHERE u.id = _user_id;
  IF NOT coalesce(_email_verified, false) THEN
    RAISE EXCEPTION 'Please confirm your email address before finishing setup.';
  END IF;

  -- An account that already holds buyer/freelancer/admin keeps it: existing
  -- users are never re-onboarded or downgraded by this function.
  SELECT ur.role INTO _existing
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
    AND ur.role IN ('buyer','freelancer','admin','super_admin','founder')
  LIMIT 1;

  IF coalesce(btrim(_full_name), '') = '' OR coalesce(btrim(_country), '') = '' THEN
    RAISE EXCEPTION 'Your full name and country are required.';
  END IF;

  IF _target = 'freelancer' THEN
    IF coalesce(btrim(_professional_title), '') = '' OR coalesce(btrim(_bio), '') = '' THEN
      RAISE EXCEPTION 'Your professional title and introduction are required.';
    END IF;
  ELSE
    IF coalesce(btrim(_industry), '') = '' THEN
      RAISE EXCEPTION 'Your industry or hiring context is required.';
    END IF;
  END IF;

  SELECT array_agg(DISTINCT btrim(l)) INTO _langs
  FROM unnest(coalesce(_languages, '{}')) AS l
  WHERE btrim(l) <> '';
  IF _langs IS NULL OR array_length(_langs, 1) IS NULL THEN
    RAISE EXCEPTION 'Select at least one language you speak.';
  END IF;

  INSERT INTO public.profiles (id, role, full_name, location, languages)
  VALUES (_user_id, coalesce(_existing, _target), btrim(_full_name), btrim(_country), _langs)
  ON CONFLICT (id) DO NOTHING;

  UPDATE public.profiles p SET
    full_name = btrim(_full_name),
    location = btrim(_country),
    languages = _langs,
    professional_title = CASE WHEN _target = 'freelancer' THEN btrim(_professional_title) ELSE p.professional_title END,
    bio = CASE WHEN _target = 'freelancer' THEN btrim(_bio) ELSE p.bio END,
    skills = CASE WHEN _target = 'freelancer' AND coalesce(btrim(_primary_skill), '') <> ''
                  THEN ARRAY[btrim(_primary_skill)] ELSE p.skills END,
    industry = CASE WHEN _target = 'buyer' THEN btrim(_industry) ELSE p.industry END,
    profile_image_url = coalesce(nullif(btrim(coalesce(_profile_image_url, '')), ''), p.profile_image_url),
    updated_at = now()
  WHERE p.id = _user_id;

  IF _existing IS NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, _target)
    ON CONFLICT (user_id, role) DO NOTHING;

    DELETE FROM public.user_roles
    WHERE user_id = _user_id AND role = 'user'::public.app_role;
  END IF;

  IF coalesce(_existing, _target) = 'freelancer'::public.app_role THEN
    INSERT INTO public.freelancers (user_id, bio, skills)
    VALUES (_user_id, btrim(coalesce(_bio, '')), CASE WHEN coalesce(btrim(_primary_skill), '') <> '' THEN ARRAY[btrim(_primary_skill)] ELSE '{}'::text[] END)
    ON CONFLICT (user_id) DO UPDATE SET
      bio = coalesce(nullif(btrim(coalesce(EXCLUDED.bio, '')), ''), public.freelancers.bio),
      skills = CASE WHEN array_length(EXCLUDED.skills, 1) IS NOT NULL THEN EXCLUDED.skills ELSE public.freelancers.skills END;
  ELSIF coalesce(_existing, _target) = 'buyer'::public.app_role THEN
    INSERT INTO public.buyers (user_id, industry)
    VALUES (_user_id, nullif(btrim(coalesce(_industry, '')), ''))
    ON CONFLICT (user_id) DO UPDATE SET
      industry = coalesce(nullif(btrim(coalesce(EXCLUDED.industry, '')), ''), public.buyers.industry);
  END IF;

  PERFORM public.sync_profile_role(_user_id);

  RETURN public.get_account_state();
END;
$function$;

REVOKE ALL ON FUNCTION public.complete_role_onboarding(text, text, text, text[], text, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_role_onboarding(text, text, text, text[], text, text, text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.complete_role_onboarding(text, text, text, text[], text, text, text, text, text) TO authenticated, service_role;