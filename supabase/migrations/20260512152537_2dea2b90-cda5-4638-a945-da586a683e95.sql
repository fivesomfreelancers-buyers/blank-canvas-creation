-- Switch view to definer mode so it bypasses base-table RLS,
-- exposing only the safe columns defined in the view (no email, no PII beyond what's already public).
ALTER VIEW public.public_profiles SET (security_invoker = off);

GRANT SELECT ON public.public_profiles TO anon, authenticated;