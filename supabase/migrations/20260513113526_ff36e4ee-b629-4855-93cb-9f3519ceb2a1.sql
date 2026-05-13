DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = off) AS
SELECT
  id,
  full_name,
  username,
  profile_image_url,
  bio,
  professional_title,
  skills,
  languages,
  location,
  role,
  member_since,
  created_at,
  last_seen
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

COMMENT ON VIEW public.public_profiles IS 'Safe public profile fields for marketplace identity display. Excludes private fields such as email and relies on the view owner so public marketplace pages can show names and avatars without exposing the base profiles table.';