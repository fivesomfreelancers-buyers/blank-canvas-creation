DROP POLICY IF EXISTS "Anyone can view freelancers" ON public.freelancers;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.gig_reviews;
DROP POLICY IF EXISTS "Authenticated can view freelancers" ON public.freelancers;
DROP POLICY IF EXISTS "Authenticated can view reviews" ON public.gig_reviews;

CREATE POLICY "Authenticated can view freelancers"
  ON public.freelancers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can view reviews"
  ON public.gig_reviews FOR SELECT TO authenticated USING (true);

DROP VIEW IF EXISTS public.public_freelancers;
CREATE VIEW public.public_freelancers
WITH (security_invoker = off) AS
SELECT id, user_id, bio, skills, rating, completed_orders, is_verified,
       is_featured, verified_at, years_experience, education_level,
       software_tools, professional_title, has_blue_tick,
       blue_tick_granted_at, created_at
FROM public.freelancers;
GRANT SELECT ON public.public_freelancers TO anon, authenticated;

DROP VIEW IF EXISTS public.public_gig_reviews;
CREATE VIEW public.public_gig_reviews
WITH (security_invoker = off) AS
SELECT id, gig_id, rating, comment, created_at
FROM public.gig_reviews;
GRANT SELECT ON public.public_gig_reviews TO anon, authenticated;