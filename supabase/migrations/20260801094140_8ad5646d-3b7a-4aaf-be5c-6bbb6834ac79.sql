DROP VIEW IF EXISTS public.admin_profiles;

CREATE OR REPLACE FUNCTION public.admin_get_profiles(_ids uuid[])
RETURNS TABLE (
  id uuid,
  full_name text,
  username text,
  email text,
  profile_image_url text,
  role public.app_role,
  bio text,
  professional_title text,
  location text,
  industry text,
  member_since timestamptz,
  last_seen timestamptz,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can read the user directory';
  END IF;

  RETURN QUERY
  SELECT p.id, p.full_name, p.username, p.email, p.profile_image_url, p.role,
         p.bio, p.professional_title, p.location, p.industry,
         p.member_since, p.last_seen, p.created_at
  FROM public.profiles p
  WHERE _ids IS NULL OR p.id = ANY(_ids);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_get_profiles(uuid[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_get_profiles(uuid[]) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_get_profiles(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_profiles(uuid[]) TO service_role;