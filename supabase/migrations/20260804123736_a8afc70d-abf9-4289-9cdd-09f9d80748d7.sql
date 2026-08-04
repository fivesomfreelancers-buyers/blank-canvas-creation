-- 1) Remove public (not signed in) access to all helper functions in the public schema
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- 2) Remove direct API access to internal helpers that are only used inside
--    triggers / SECURITY DEFINER functions (never called from the app)
REVOKE EXECUTE ON FUNCTION public.get_withdrawal_fee_percent() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_freelancer_gig_limit(uuid) FROM authenticated;

-- 3) Keep the functions the app and RLS policies genuinely need for signed-in users
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_dispute_participant(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_owns_support_ticket(text, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_profiles(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_grant_blue_tick(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reject_blue_tick(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_revoke_blue_tick(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_vip(uuid, public.vip_tier) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_remove_vip(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_system_conversations(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.broadcast_news(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_vip_memberships() TO authenticated;
GRANT EXECUTE ON FUNCTION public.touch_last_seen() TO authenticated;

-- 4) Service role (edge functions / admin backend) keeps full access
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;