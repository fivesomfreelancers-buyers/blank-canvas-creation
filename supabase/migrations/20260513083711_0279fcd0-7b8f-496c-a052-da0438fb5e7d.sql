-- Make public_profiles view bypass RLS so anyone can view safe public fields (name, avatar, etc.)
-- The base profiles table still restricts direct access. Sensitive fields (email) are excluded from the view.
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