CREATE OR REPLACE FUNCTION public.admin_delete_orders(_ids uuid[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _deleted integer := 0;
BEGIN
  IF NOT public.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can delete orders';
  END IF;

  IF _ids IS NULL OR array_length(_ids, 1) IS NULL THEN
    RETURN 0;
  END IF;

  DELETE FROM public.dispute_messages dm
  USING public.disputes d
  WHERE dm.dispute_id = d.id AND d.order_id = ANY(_ids);

  DELETE FROM public.disputes WHERE order_id = ANY(_ids);

  DELETE FROM public.accepted_deliveries WHERE order_id = ANY(_ids);

  DELETE FROM public.order_requirement_files f
  USING public.order_requirements r
  WHERE f.order_requirement_id = r.id AND r.order_id = ANY(_ids);

  DELETE FROM public.order_requirements WHERE order_id = ANY(_ids);

  DELETE FROM public.order_deliveries WHERE order_id = ANY(_ids);

  UPDATE public.gig_reviews SET order_id = NULL WHERE order_id = ANY(_ids);

  DELETE FROM public.orders WHERE id = ANY(_ids);
  GET DIAGNOSTICS _deleted = ROW_COUNT;

  INSERT INTO public.admin_action_logs (admin_id, action, target_table, target_id, metadata)
  VALUES (auth.uid(), 'delete_orders', 'orders', NULL, jsonb_build_object('count', _deleted, 'ids', to_jsonb(_ids)));

  RETURN _deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_orders(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_orders(uuid[]) TO authenticated;