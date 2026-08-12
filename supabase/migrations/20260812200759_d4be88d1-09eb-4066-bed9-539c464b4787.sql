-- The public view was created as SECURITY DEFINER, which bypasses the caller's RLS.
-- Switch it to SECURITY INVOKER so it enforces the querying user's policies.
ALTER VIEW public.public_gig_reviews SET (security_invoker = true);

-- The view joins gig_reviews.buyer_id to profiles.id. With security_invoker=true,
-- the caller needs SELECT on the join column. Grant only that column to keep access minimal.
GRANT SELECT (buyer_id) ON public.gig_reviews TO anon, authenticated;