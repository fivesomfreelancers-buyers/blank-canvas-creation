CREATE OR REPLACE FUNCTION public.buyer_acquisition_summary() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE result jsonb;
BEGIN
 IF auth.uid() IS NULL OR NOT public.is_admin_user(auth.uid()) THEN RAISE EXCEPTION 'Admin or Founder access required' USING ERRCODE='42501'; END IF;
 SELECT jsonb_build_object(
 'total_buyers',(SELECT count(*) FROM public.buyers),
 'new_today',(SELECT count(*) FROM public.buyers WHERE created_at >= date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'),
 'new_week',(SELECT count(*) FROM public.buyers WHERE created_at >= date_trunc('week', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'),
 'new_month',(SELECT count(*) FROM public.buyers WHERE created_at >= date_trunc('month', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'),
 'active_buyers_30d',(SELECT count(*) FROM public.buyers b JOIN public.profiles p ON p.id=b.user_id WHERE p.last_seen >= now()-interval '30 days'),
 'paid_orders',(SELECT count(*) FROM public.orders WHERE payment_status='paid'),
 'purchasing_buyers',(SELECT count(DISTINCT buyer_id) FROM public.orders WHERE payment_status='paid'),
 'repeat_buyers',(SELECT count(*) FROM (SELECT buyer_id FROM public.orders WHERE payment_status='paid' GROUP BY buyer_id HAVING count(*)>1) r),
 'daily',coalesce((SELECT jsonb_agg(d ORDER BY d.date) FROM (SELECT to_char(gs.bucket,'YYYY-MM-DD') AS date,(SELECT count(*) FROM public.buyers WHERE created_at>=gs.bucket AND created_at<gs.bucket+interval '1 day') AS registrations FROM generate_series((date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')-interval '29 days',date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC',interval '1 day') AS gs(bucket)) d),'[]'::jsonb)
 ) INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.buyer_acquisition_summary() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.buyer_acquisition_summary() TO authenticated, service_role;