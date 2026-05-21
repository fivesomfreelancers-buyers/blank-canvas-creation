CREATE OR REPLACE FUNCTION public.admin_set_vip(_user_id uuid, _tier public.vip_tier)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _exp timestamptz; _fid uuid;
BEGIN
  IF NOT public.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can set VIP';
  END IF;
  IF _tier = 'golden' THEN _exp := now() + interval '30 days';
  ELSE _exp := now() + interval '1 year'; END IF;
  UPDATE public.freelancers SET vip_tier = _tier, vip_started_at = now(), vip_expires_at = _exp
    WHERE user_id = _user_id RETURNING id INTO _fid;
  INSERT INTO public.vip_memberships(user_id, freelancer_id, tier, payment_status, activated_at, expires_at, granted_by)
  VALUES (_user_id, _fid, _tier, 'activated', now(), _exp, auth.uid());
END $$;

CREATE OR REPLACE FUNCTION public.admin_remove_vip(_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can remove VIP';
  END IF;
  UPDATE public.freelancers SET vip_tier = NULL, vip_started_at = NULL, vip_expires_at = NULL
    WHERE user_id = _user_id;
  UPDATE public.vip_memberships SET payment_status = 'removed', updated_at = now()
    WHERE user_id = _user_id AND payment_status = 'activated';
END $$;

CREATE OR REPLACE FUNCTION public.expire_vip_memberships()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _c int;
BEGIN
  UPDATE public.freelancers SET vip_tier = NULL, vip_started_at = NULL, vip_expires_at = NULL
    WHERE vip_expires_at IS NOT NULL AND vip_expires_at < now();
  GET DIAGNOSTICS _c = ROW_COUNT;
  UPDATE public.vip_memberships SET payment_status = 'expired', updated_at = now()
    WHERE payment_status = 'activated' AND expires_at < now();
  RETURN _c;
END $$;