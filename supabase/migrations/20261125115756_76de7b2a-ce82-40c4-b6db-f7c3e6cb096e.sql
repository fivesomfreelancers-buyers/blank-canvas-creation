CREATE OR REPLACE FUNCTION public.get_top_ranked_freelancers(_limit int DEFAULT 10)
RETURNS TABLE(freelancer_id uuid, user_id uuid, full_name text, username text, avatar text, skill text, ranking_score numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT f.id, f.user_id, p.full_name, p.username, p.profile_image_url,
         COALESCE(NULLIF(p.professional_title,''), f.skills[1], 'Freelancer'), f.ranking_score
  FROM public.freelancers f
  JOIN public.profiles p ON p.id = f.user_id
  WHERE public.is_listed_freelancer(f.id) AND COALESCE(f.ranking_score,0) > 0
  ORDER BY f.ranking_score DESC, f.id
  LIMIT LEAST(GREATEST(_limit,1),10);
$$;
GRANT EXECUTE ON FUNCTION public.get_top_ranked_freelancers(int) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_freelancer_ranking_score(_freelancer_id uuid, _score numeric)
RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v numeric;
BEGIN
  IF NOT (public.is_admin_user(auth.uid()) OR public.is_founder_user(auth.uid())) THEN
    RAISE EXCEPTION 'Only admins or founders can set ranking scores';
  END IF;
  IF _score IS NULL OR _score < 0 OR _score > 100000 THEN
    RAISE EXCEPTION 'Score must be between 0 and 100000';
  END IF;
  UPDATE public.freelancers SET ranking_score = _score WHERE id = _freelancer_id RETURNING ranking_score INTO v;
  IF v IS NULL THEN RAISE EXCEPTION 'Freelancer not found'; END IF;
  RETURN v;
END; $$;
REVOKE EXECUTE ON FUNCTION public.set_freelancer_ranking_score(uuid, numeric) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.set_freelancer_ranking_score(uuid, numeric) TO authenticated;