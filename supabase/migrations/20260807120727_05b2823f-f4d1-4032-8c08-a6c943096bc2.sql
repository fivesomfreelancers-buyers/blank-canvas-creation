CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _role public.app_role;
BEGIN
  BEGIN
    _role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', '')::public.app_role, 'user'::public.app_role);
  EXCEPTION WHEN others THEN
    _role := 'user'::public.app_role;
  END;

  IF _role NOT IN ('user'::public.app_role, 'buyer'::public.app_role, 'freelancer'::public.app_role) THEN
    _role := 'user'::public.app_role;
  END IF;

  BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, location, profile_image_url)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
      NEW.email,
      _role,
      NEW.raw_user_meta_data->>'location',
      COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN others THEN
    RAISE WARNING 'handle_new_user: profile insert failed for % : %', NEW.id, SQLERRM;
  END;

  BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, _role)
    ON CONFLICT (user_id, role) DO NOTHING;
  EXCEPTION WHEN others THEN
    RAISE WARNING 'handle_new_user: role insert failed for % : %', NEW.id, SQLERRM;
  END;

  BEGIN
    IF _role = 'freelancer'::public.app_role THEN
      INSERT INTO public.freelancers (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    ELSIF _role = 'buyer'::public.app_role THEN
      INSERT INTO public.buyers (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
    END IF;
  EXCEPTION WHEN others THEN
    RAISE WARNING 'handle_new_user: role table insert failed for % : %', NEW.id, SQLERRM;
  END;

  BEGIN
    INSERT INTO public.wallets (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  EXCEPTION WHEN others THEN
    RAISE WARNING 'handle_new_user: wallet insert failed for % : %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.profile_bootstrap_system()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  BEGIN
    PERFORM public.bootstrap_system_conversations(NEW.id);
  EXCEPTION WHEN others THEN
    RAISE WARNING 'profile_bootstrap_system failed for % : %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END $function$;