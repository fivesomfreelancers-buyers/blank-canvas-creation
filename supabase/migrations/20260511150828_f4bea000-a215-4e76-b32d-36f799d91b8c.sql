
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker=false) AS
SELECT id, full_name, username, profile_image_url, bio, professional_title,
       skills, languages, location, role, member_since, created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;
