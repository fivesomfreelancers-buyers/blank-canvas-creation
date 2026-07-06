
-- Fix CRITICAL: 3 SECURITY DEFINER views -> switch to security_invoker=on
-- so the querying user's RLS applies (not the view owner's).

DROP VIEW IF EXISTS public.public_profiles;
DROP VIEW IF EXISTS public.public_freelancers;
DROP VIEW IF EXISTS public.public_gig_reviews;

CREATE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT id, full_name, username, profile_image_url, bio, professional_title,
       skills, languages, location, role, member_since, created_at, last_seen
FROM public.profiles;

CREATE VIEW public.public_freelancers
WITH (security_invoker = true) AS
SELECT id, user_id, bio, skills, rating, completed_orders, is_verified,
       is_featured, verified_at, years_experience, education_level,
       software_tools, professional_title, has_blue_tick,
       blue_tick_granted_at, created_at
FROM public.freelancers;

CREATE VIEW public.public_gig_reviews
WITH (security_invoker = true) AS
SELECT id, gig_id, rating, comment, created_at
FROM public.gig_reviews;

GRANT SELECT ON public.public_profiles     TO anon, authenticated;
GRANT SELECT ON public.public_freelancers  TO anon, authenticated;
GRANT SELECT ON public.public_gig_reviews  TO anon, authenticated;

-- Reduce attack surface: admin-only SECURITY DEFINER functions should not
-- be executable by anon. authenticated retains EXECUTE; the function bodies
-- enforce is_admin_user(auth.uid()) internally.
REVOKE EXECUTE ON FUNCTION public.admin_set_vip(uuid, public.vip_tier)     FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_remove_vip(uuid)                    FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_grant_blue_tick(uuid, uuid, text)   FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_revoke_blue_tick(uuid, text)        FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_reject_blue_tick(uuid, text)        FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.broadcast_news(text, text, text)          FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.expire_vip_memberships()                  FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.bootstrap_system_conversations(uuid)      FROM PUBLIC, anon;
