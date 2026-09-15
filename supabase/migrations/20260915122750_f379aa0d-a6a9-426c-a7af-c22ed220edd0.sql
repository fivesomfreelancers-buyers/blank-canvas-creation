CREATE OR REPLACE FUNCTION public.get_blue_tick_eligibility(_user_id uuid DEFAULT auth.uid())
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_actor uuid := auth.uid();
  v_freelancer public.freelancers%ROWTYPE;
  v_created_at timestamptz;
  v_last_seen timestamptz;
  v_member_days integer := 0;
  v_completed_orders integer := 0;
  v_earnings numeric := 0;
  v_rating numeric := 0;
  v_review_count integer := 0;
  v_warnings integer := 0;
  v_identity boolean := false;
  v_recent boolean := false;
  v_complete integer := 0;
BEGIN
  IF v_actor IS NULL OR (_user_id <> v_actor AND NOT public.is_admin_user(v_actor)) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO v_freelancer FROM public.freelancers WHERE user_id = _user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Freelancer profile not found'; END IF;

  SELECT COALESCE(member_since, created_at), last_seen
    INTO v_created_at, v_last_seen
    FROM public.profiles WHERE id = _user_id;

  v_member_days := GREATEST(0, floor(extract(epoch FROM (now() - COALESCE(v_created_at, now()))) / 86400)::integer);
  v_recent := v_last_seen IS NOT NULL AND v_last_seen >= now() - interval '30 days';
  v_identity := COALESCE(v_freelancer.is_verified, false) AND EXISTS (
    SELECT 1 FROM public.verification_documents vd
    WHERE vd.user_id = _user_id AND vd.status = 'approved'::public.verification_status
  );

  SELECT count(*)::integer, COALESCE(sum(COALESCE(o.freelancer_earnings, GREATEST(o.amount - COALESCE(o.buyer_service_fee, 0), 0))), 0)
    INTO v_completed_orders, v_earnings
    FROM public.orders o
    WHERE o.freelancer_id = v_freelancer.id AND o.status = 'completed'::public.order_status;

  SELECT count(gr.id)::integer, COALESCE(avg(gr.rating), 0)
    INTO v_review_count, v_rating
    FROM public.gig_reviews gr
    JOIN public.gigs g ON g.id = gr.gig_id
    WHERE g.freelancer_id = v_freelancer.id;

  SELECT count(*)::integer INTO v_warnings
    FROM public.user_warnings w
    WHERE w.user_id = _user_id
      AND w.status = 'active'
      AND (w.expires_at IS NULL OR w.expires_at > now());

  v_complete :=
    (CASE WHEN v_identity THEN 1 ELSE 0 END) +
    (CASE WHEN v_member_days >= 40 THEN 1 ELSE 0 END) +
    (CASE WHEN v_recent THEN 1 ELSE 0 END) +
    (CASE WHEN v_completed_orders >= 10 THEN 1 ELSE 0 END) +
    (CASE WHEN v_earnings >= 100 THEN 1 ELSE 0 END) +
    (CASE WHEN v_rating >= 4.5 THEN 1 ELSE 0 END) +
    (CASE WHEN v_warnings <= 3 THEN 1 ELSE 0 END);

  RETURN jsonb_build_object(
    'user_id', _user_id,
    'freelancer_id', v_freelancer.id,
    'identity_verified', v_identity,
    'member_days', v_member_days,
    'recent_activity', v_recent,
    'last_seen', v_last_seen,
    'completed_orders', v_completed_orders,
    'earnings', round(v_earnings, 2),
    'rating', round(v_rating, 2),
    'review_count', v_review_count,
    'active_warnings', v_warnings,
    'requirements_complete', v_complete,
    'requirements_total', 7,
    'eligible', v_complete = 7,
    'has_blue_tick', COALESCE(v_freelancer.has_blue_tick, false),
    'calculated_at', now()
  );
END;
$function$;