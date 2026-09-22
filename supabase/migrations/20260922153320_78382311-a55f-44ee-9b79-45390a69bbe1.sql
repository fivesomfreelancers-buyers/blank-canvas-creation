CREATE OR REPLACE FUNCTION public.user_roles_require_verified_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _actor_id uuid := auth.uid();
BEGIN
  -- Server-side administrative work has no end-user auth subject and remains
  -- governed by its privileged database identity.
  IF _actor_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Admin/founder actions are allowed only when the authenticated actor really
  -- holds that database role. Always pass the actor id to the helpers.
  IF public.is_admin_user(_actor_id) OR public.is_founder_user(_actor_id) THEN
    RETURN NEW;
  END IF;

  IF NEW.role IN ('buyer'::public.app_role, 'freelancer'::public.app_role)
     AND NOT public.is_email_verified(NEW.user_id) THEN
    RAISE EXCEPTION 'Email address must be confirmed before becoming a % on Fivesom', NEW.role
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.user_roles_require_verified_email() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.user_roles_require_verified_email() TO service_role;

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
  _result jsonb;
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

  SELECT ur.role INTO _existing
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
    AND ur.role IN ('buyer','freelancer','admin','super_admin','founder')
  ORDER BY CASE ur.role
    WHEN 'founder' THEN 1 WHEN 'super_admin' THEN 2 WHEN 'admin' THEN 3
    WHEN 'freelancer' THEN 4 WHEN 'buyer' THEN 5 ELSE 6 END
  LIMIT 1;

  IF coalesce(btrim(_full_name), '') = '' OR char_length(btrim(_full_name)) > 100
     OR coalesce(btrim(_country), '') = '' OR char_length(btrim(_country)) > 120 THEN
    RAISE EXCEPTION 'Enter a valid full name and country.';
  END IF;

  IF _target = 'freelancer' THEN
    IF coalesce(btrim(_professional_title), '') = '' OR char_length(btrim(_professional_title)) > 100 THEN
      RAISE EXCEPTION 'Professional title is required.';
    END IF;
    IF coalesce(btrim(_primary_skill), '') = '' OR char_length(btrim(_primary_skill)) > 100 THEN
      RAISE EXCEPTION 'Choose your primary skill.';
    END IF;
    IF char_length(btrim(coalesce(_bio, ''))) < 50 OR char_length(btrim(coalesce(_bio, ''))) > 500 THEN
      RAISE EXCEPTION 'Professional introduction must be between 50 and 500 characters.';
    END IF;
  ELSIF coalesce(btrim(_industry), '') = '' OR char_length(btrim(_industry)) > 120 THEN
    RAISE EXCEPTION 'Choose your industry or hiring context.';
  END IF;

  SELECT array_agg(language ORDER BY language) INTO _langs
  FROM (
    SELECT DISTINCT btrim(value) AS language
    FROM unnest(coalesce(_languages, '{}')) AS value
    WHERE btrim(value) <> '' AND char_length(btrim(value)) <= 50
  ) normalized;
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
    skills = CASE WHEN _target = 'freelancer' THEN ARRAY[btrim(_primary_skill)] ELSE p.skills END,
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
    INSERT INTO public.freelancers (user_id, bio, skills, professional_title)
    VALUES (_user_id, btrim(_bio), ARRAY[btrim(_primary_skill)], btrim(_professional_title))
    ON CONFLICT (user_id) DO UPDATE SET
      bio = coalesce(nullif(EXCLUDED.bio, ''), public.freelancers.bio),
      skills = CASE WHEN coalesce(EXCLUDED.skills[1], '') <> '' THEN EXCLUDED.skills ELSE public.freelancers.skills END,
      professional_title = coalesce(nullif(EXCLUDED.professional_title, ''), public.freelancers.professional_title);
  ELSIF coalesce(_existing, _target) = 'buyer'::public.app_role THEN
    INSERT INTO public.buyers (user_id, industry)
    VALUES (_user_id, nullif(btrim(_industry), ''))
    ON CONFLICT (user_id) DO UPDATE SET
      industry = coalesce(nullif(EXCLUDED.industry, ''), public.buyers.industry);
  END IF;

  PERFORM public.sync_profile_role(_user_id);
  _result := public.get_account_state();

  IF coalesce(_result->>'onboarding_status', '') <> 'complete' THEN
    RAISE EXCEPTION 'Your account was saved but could not be confirmed as complete.';
  END IF;

  IF _existing IS NULL AND coalesce(_result->>'active_role', '') <> _role THEN
    RAISE EXCEPTION 'Your account role could not be confirmed.';
  END IF;

  RETURN _result;
END;
$function$;

REVOKE ALL ON FUNCTION public.complete_role_onboarding(text, text, text, text[], text, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_role_onboarding(text, text, text, text[], text, text, text, text, text) TO authenticated, service_role;