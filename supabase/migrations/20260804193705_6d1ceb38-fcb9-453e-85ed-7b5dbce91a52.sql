-- =========================================================================
-- 1. Hide freelancer financial / payout columns from client roles
-- =========================================================================

-- Drop blanket SELECT access (all columns) for client roles.
REVOKE SELECT ON public.freelancers FROM anon;
REVOKE SELECT ON public.freelancers FROM authenticated;
-- Remove the leftover column-level grant on total_earnings.
REVOKE SELECT (total_earnings) ON public.freelancers FROM authenticated;
REVOKE SELECT (total_earnings) ON public.freelancers FROM anon;

-- Re-grant SELECT only on non-financial, browsing-relevant columns.
-- Excluded on purpose: total_earnings, stripe_account_id, stripe_payouts_enabled,
-- stripe_charges_enabled, stripe_details_submitted, stripe_onboarded_at.
GRANT SELECT (
  id, user_id, bio, skills, rating, completed_orders, is_verified, created_at,
  ranking_score, is_featured, verified_at, years_experience, education_level,
  software_tools, professional_title, verification_removed_at,
  verification_removal_reason, verification_removed_by,
  vip_tier, vip_started_at, vip_expires_at,
  has_blue_tick, blue_tick_granted_at, blue_tick_removed_at, blue_tick_removed_reason
) ON public.freelancers TO anon;

GRANT SELECT (
  id, user_id, bio, skills, rating, completed_orders, is_verified, created_at,
  ranking_score, is_featured, verified_at, years_experience, education_level,
  software_tools, professional_title, verification_removed_at,
  verification_removal_reason, verification_removed_by,
  vip_tier, vip_started_at, vip_expires_at,
  has_blue_tick, blue_tick_granted_at, blue_tick_removed_at, blue_tick_removed_reason
) ON public.freelancers TO authenticated;

GRANT ALL ON public.freelancers TO service_role;

-- Owner / admin access to earnings without exposing the column to everyone.
CREATE OR REPLACE FUNCTION public.get_freelancer_earnings(_ids uuid[] DEFAULT NULL)
RETURNS TABLE(id uuid, user_id uuid, total_earnings numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.id, f.user_id, f.total_earnings
  FROM public.freelancers f
  WHERE f.user_id = auth.uid()
     OR (public.is_admin_user(auth.uid()) AND (_ids IS NULL OR f.id = ANY(_ids)))
$$;

REVOKE ALL ON FUNCTION public.get_freelancer_earnings(uuid[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_freelancer_earnings(uuid[]) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_freelancer_earnings(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_freelancer_earnings(uuid[]) TO service_role;

-- =========================================================================
-- 2. Stop freelancers from forging verification / payout / earnings fields
-- =========================================================================

-- Snapshot of the privileged columns of the pre-update row. SECURITY DEFINER so
-- the RLS policy can compare them without granting the caller column access.
CREATE OR REPLACE FUNCTION public.freelancer_privileged_snapshot(_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT to_jsonb(x) FROM (
    SELECT
      f.user_id,
      f.rating,
      f.total_earnings,
      f.completed_orders,
      f.is_verified,
      f.ranking_score,
      f.is_featured,
      f.verified_at,
      f.verification_removed_at,
      f.verification_removed_by,
      f.verification_removal_reason,
      f.has_blue_tick,
      f.blue_tick_granted_at,
      f.blue_tick_removed_at,
      f.blue_tick_removed_reason,
      f.vip_tier,
      f.vip_started_at,
      f.vip_expires_at,
      f.stripe_account_id,
      f.stripe_payouts_enabled,
      f.stripe_charges_enabled,
      f.stripe_details_submitted,
      f.stripe_onboarded_at
    FROM public.freelancers f
    WHERE f.id = _id
  ) x
$$;

REVOKE ALL ON FUNCTION public.freelancer_privileged_snapshot(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.freelancer_privileged_snapshot(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.freelancer_privileged_snapshot(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.freelancer_privileged_snapshot(uuid) TO service_role;

DROP POLICY IF EXISTS "Users can update own public freelancer fields" ON public.freelancers;

CREATE POLICY "Users can update own public freelancer fields"
ON public.freelancers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND public.freelancer_privileged_snapshot(id) = jsonb_build_object(
    'user_id', user_id,
    'rating', rating,
    'total_earnings', total_earnings,
    'completed_orders', completed_orders,
    'is_verified', is_verified,
    'ranking_score', ranking_score,
    'is_featured', is_featured,
    'verified_at', verified_at,
    'verification_removed_at', verification_removed_at,
    'verification_removed_by', verification_removed_by,
    'verification_removal_reason', verification_removal_reason,
    'has_blue_tick', has_blue_tick,
    'blue_tick_granted_at', blue_tick_granted_at,
    'blue_tick_removed_at', blue_tick_removed_at,
    'blue_tick_removed_reason', blue_tick_removed_reason,
    'vip_tier', vip_tier,
    'vip_started_at', vip_started_at,
    'vip_expires_at', vip_expires_at,
    'stripe_account_id', stripe_account_id,
    'stripe_payouts_enabled', stripe_payouts_enabled,
    'stripe_charges_enabled', stripe_charges_enabled,
    'stripe_details_submitted', stripe_details_submitted,
    'stripe_onboarded_at', stripe_onboarded_at
  )
);