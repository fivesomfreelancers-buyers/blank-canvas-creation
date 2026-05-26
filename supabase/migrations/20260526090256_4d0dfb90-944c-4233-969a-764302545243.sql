-- Restrict sensitive freelancer financial / moderation columns from anonymous visitors.
-- Authenticated users (owner, admin, etc.) keep access; row-level policies still apply.
REVOKE SELECT (total_earnings, verification_removal_reason, verification_removed_by)
  ON public.freelancers FROM anon;