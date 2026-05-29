
DROP POLICY IF EXISTS "Anyone can read announcements" ON public.admin_announcements;
DROP POLICY IF EXISTS "Authenticated users read targeted announcements" ON public.admin_announcements;

CREATE POLICY "Authenticated users read targeted announcements"
ON public.admin_announcements
FOR SELECT
TO authenticated
USING (
  audience = 'all'
  OR (audience = 'buyers' AND public.has_role(auth.uid(), 'buyer'::public.app_role))
  OR (audience = 'freelancers' AND public.has_role(auth.uid(), 'freelancer'::public.app_role))
  OR public.is_admin_user(auth.uid())
);

REVOKE SELECT ON public.admin_announcements FROM anon;

REVOKE SELECT (
  total_earnings,
  ranking_score,
  vip_started_at,
  vip_expires_at,
  verification_removed_at,
  verification_removal_reason,
  verification_removed_by,
  blue_tick_removed_at,
  blue_tick_removed_reason
) ON public.freelancers FROM anon;

REVOKE SELECT (buyer_id) ON public.gig_reviews FROM anon;
