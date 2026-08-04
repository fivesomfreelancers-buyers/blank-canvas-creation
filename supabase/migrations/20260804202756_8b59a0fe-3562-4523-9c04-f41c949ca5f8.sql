-- 1) Signup trigger: neutral 'user' role + role row + wallet
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _role public.app_role;
BEGIN
  _role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', '')::public.app_role, 'user'::public.app_role);
  IF _role NOT IN ('user'::public.app_role, 'buyer'::public.app_role, 'freelancer'::public.app_role) THEN
    _role := 'user'::public.app_role;
  END IF;

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

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  IF _role = 'freelancer'::public.app_role THEN
    INSERT INTO public.freelancers (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  ELSIF _role = 'buyer'::public.app_role THEN
    INSERT INTO public.buyers (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  END IF;

  INSERT INTO public.wallets (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$function$;

-- 2) Allow the neutral 'user' role to be self-assigned
DROP POLICY IF EXISTS "Users can self-assign non-admin roles" ON public.user_roles;
CREATE POLICY "Users can self-assign non-admin roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role = ANY (ARRAY['user'::public.app_role, 'buyer'::public.app_role, 'freelancer'::public.app_role])
);

-- 3) Allow users to drop their own placeholder 'user' role after upgrading
DROP POLICY IF EXISTS "Users can drop own placeholder role" ON public.user_roles;
CREATE POLICY "Users can drop own placeholder role"
ON public.user_roles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND role = 'user'::public.app_role);

-- 4) Allow self role changes between non-admin roles (email still pinned)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND NOT (email IS DISTINCT FROM (SELECT p.email FROM public.profiles p WHERE p.id = profiles.id))
  AND role = ANY (ARRAY['user'::public.app_role, 'buyer'::public.app_role, 'freelancer'::public.app_role])
);