-- Admin-only directory view: exposes profile fields incl. email, but ONLY to admins.
-- security_invoker is intentionally OFF so the view can read the email column
-- (which is not granted to anon/authenticated on the base table); access is gated
-- by the is_admin_user() predicate inside the view.
DROP VIEW IF EXISTS public.admin_profiles;

CREATE VIEW public.admin_profiles AS
SELECT
  p.id,
  p.full_name,
  p.username,
  p.email,
  p.profile_image_url,
  p.role,
  p.bio,
  p.professional_title,
  p.location,
  p.industry,
  p.languages,
  p.member_since,
  p.last_seen,
  p.created_at,
  p.updated_at
FROM public.profiles p
WHERE public.is_admin_user(auth.uid());

REVOKE ALL ON public.admin_profiles FROM anon;
GRANT SELECT ON public.admin_profiles TO authenticated;
GRANT SELECT ON public.admin_profiles TO service_role;