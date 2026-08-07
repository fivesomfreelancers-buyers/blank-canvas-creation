CREATE OR REPLACE FUNCTION public.delete_gig(_gig_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _is_admin boolean;
  _owner uuid;
  _files jsonb := '[]'::jsonb;
  _urls text[] := '{}';
  _u text;
  _bucket text;
  _path text;
  _g public.gigs;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO _g FROM public.gigs WHERE id = _gig_id;
  IF _g.id IS NULL THEN
    RAISE EXCEPTION 'Gig not found';
  END IF;

  SELECT f.user_id INTO _owner FROM public.freelancers f WHERE f.id = _g.freelancer_id;
  _is_admin := public.is_admin_user(_uid);

  IF NOT _is_admin AND _owner IS DISTINCT FROM _uid THEN
    RAISE EXCEPTION 'You can only delete your own gigs';
  END IF;

  -- Collect storage files belonging to this gig (thumbnail, gallery images, media rows)
  IF _g.thumbnail_url IS NOT NULL AND _g.thumbnail_url <> '' THEN
    _urls := _urls || _g.thumbnail_url;
  END IF;
  IF _g.images IS NOT NULL THEN
    _urls := _urls || _g.images;
  END IF;
  SELECT _urls || COALESCE(array_agg(m.file_url), '{}')
    INTO _urls
  FROM public.gig_media m
  WHERE m.gig_id = _gig_id AND m.file_url IS NOT NULL;

  FOREACH _u IN ARRAY _urls LOOP
    IF _u IS NULL OR _u = '' THEN CONTINUE; END IF;
    _bucket := substring(_u from '/storage/v1/object/(?:public/|sign/)?([^/]+)/');
    _path   := substring(_u from '/storage/v1/object/(?:public/|sign/)?[^/]+/(.+)$');
    IF _bucket IS NOT NULL AND _path IS NOT NULL THEN
      _path := split_part(_path, '?', 1);
      _files := _files || jsonb_build_object('bucket', _bucket, 'path', _path);
    END IF;
  END LOOP;

  -- Related records. Orders are kept for financial history but detached from the gig.
  UPDATE public.orders SET gig_id = NULL WHERE gig_id = _gig_id;
  DELETE FROM public.gig_reviews WHERE gig_id = _gig_id;
  DELETE FROM public.gig_media WHERE gig_id = _gig_id;
  DELETE FROM public.gig_packages WHERE gig_id = _gig_id;
  DELETE FROM public.gigs WHERE id = _gig_id;

  IF _is_admin THEN
    INSERT INTO public.admin_action_logs (admin_id, action, target_table, target_id, metadata)
    VALUES (_uid, 'delete_gig', 'gigs', _gig_id::text,
            jsonb_build_object('title', _g.title, 'owner', _owner, 'files', _files));
  END IF;

  RETURN jsonb_build_object('deleted', true, 'files', _files);
END;
$$;

REVOKE ALL ON FUNCTION public.delete_gig(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_gig(uuid) TO authenticated;