CREATE OR REPLACE FUNCTION public.platform_stats()
RETURNS TABLE (freelancers bigint, active_gigs bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM public.freelancers)::bigint,
    (SELECT count(*) FROM public.gigs WHERE status = 'active')::bigint
$$;

REVOKE ALL ON FUNCTION public.platform_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.platform_stats() TO anon, authenticated, service_role;

-- keep the homepage numbers live
DO $do$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.freelancers;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.gigs;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END
$do$;