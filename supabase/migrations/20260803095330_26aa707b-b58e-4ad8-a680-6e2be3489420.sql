-- 1) Lock down SECURITY DEFINER routines: no direct calls from anon or authenticated
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon, authenticated, PUBLIC', r.sig);
  END LOOP;
END $$;

-- Re-grant only what the app actually calls, and only to signed-in users
GRANT EXECUTE ON FUNCTION public.admin_get_profiles(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_grant_blue_tick(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reject_blue_tick(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_revoke_blue_tick(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_vip(uuid, public.vip_tier) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_remove_vip(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.broadcast_news(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_system_conversations(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_vip_memberships() TO authenticated;
GRANT EXECUTE ON FUNCTION public.touch_last_seen() TO authenticated;

-- Helpers referenced inside RLS policies must stay callable by the roles those policies apply to
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_dispute_participant(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_owns_support_ticket(text, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_freelancer_gig_limit(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_withdrawal_fee_percent() TO anon, authenticated;

-- 2) Public buckets: drop broad listing policies (public URLs keep working)
DROP POLICY IF EXISTS "Anyone can view gig images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view gig media" ON storage.objects;
DROP POLICY IF EXISTS "Public read gig-thumbnails by id" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view verification portfolio" ON storage.objects;