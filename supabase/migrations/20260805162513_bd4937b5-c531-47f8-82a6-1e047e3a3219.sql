-- Public pages (ads, gigs) evaluate role-check helpers inside their RLS policies,
-- so anonymous visitors need EXECUTE on these two read-only helpers.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO anon;