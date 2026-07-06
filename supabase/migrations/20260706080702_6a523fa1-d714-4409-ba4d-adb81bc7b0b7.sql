
-- =========================================================
-- Public read access for marketplace browsing
-- =========================================================
-- Add permissive SELECT policies so anon + authenticated can browse
-- profiles/freelancers/gig_reviews. Sensitive columns are protected
-- with column-level GRANTs (email hidden from everyone but service_role).

-- ---------- profiles ----------
-- Row-level: anyone can read any profile row.
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Column-level: hide email from anon and authenticated.
-- Owners still get their email from auth.getUser(); admins use service_role
-- (or the existing "Admins can view all profiles" policy + admin dashboards
-- that go through edge functions with service_role).
REVOKE SELECT ON public.profiles FROM anon, authenticated;

GRANT SELECT
  (id, role, full_name, username, profile_image_url, bio, professional_title,
   location, skills, languages, industry, member_since, created_at, updated_at, last_seen)
  ON public.profiles TO anon, authenticated;

-- ---------- freelancers ----------
-- All columns on freelancers are marketplace-public (bio, skills, rating,
-- completed_orders, verification/blue-tick/VIP flags, etc.).
DROP POLICY IF EXISTS "Public can view freelancers" ON public.freelancers;
CREATE POLICY "Public can view freelancers"
  ON public.freelancers
  FOR SELECT
  TO anon, authenticated
  USING (true);

GRANT SELECT ON public.freelancers TO anon;

-- ---------- gig_reviews ----------
DROP POLICY IF EXISTS "Public can view reviews" ON public.gig_reviews;
CREATE POLICY "Public can view reviews"
  ON public.gig_reviews
  FOR SELECT
  TO anon, authenticated
  USING (true);

GRANT SELECT ON public.gig_reviews TO anon;

-- ---------- gigs (already public via existing policies, ensure anon SELECT grant) ----------
GRANT SELECT ON public.gigs TO anon;
GRANT SELECT ON public.gig_packages TO anon;
GRANT SELECT ON public.gig_media TO anon;
GRANT SELECT ON public.subcategories TO anon;
GRANT SELECT ON public.freelancer_portfolio TO anon;
GRANT SELECT ON public.freelancer_faqs TO anon;
