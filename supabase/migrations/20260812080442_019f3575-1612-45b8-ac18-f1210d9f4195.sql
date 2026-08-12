DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'founder'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'founder';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.is_founder_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text = 'founder'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin'::public.app_role)
      OR public.has_role(_user_id, 'super_admin'::public.app_role)
      OR public.is_founder_user(_user_id)
$$;

CREATE OR REPLACE FUNCTION public.list_founders()
RETURNS TABLE(user_id uuid, full_name text, username text, profile_image_url text, last_seen timestamptz)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_founder_user(auth.uid()) THEN
    RAISE EXCEPTION 'Only founders can list founders';
  END IF;

  RETURN QUERY
  SELECT ur.user_id, p.full_name, p.username, p.profile_image_url, p.last_seen
  FROM public.user_roles ur
  JOIN public.profiles p ON p.id = ur.user_id
  WHERE ur.role::text = 'founder';
END $$;

GRANT EXECUTE ON FUNCTION public.is_founder_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_founders() TO authenticated;