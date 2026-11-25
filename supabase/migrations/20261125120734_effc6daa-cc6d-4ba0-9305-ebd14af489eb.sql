CREATE OR REPLACE FUNCTION public.get_top_ranked_freelancers(_limit int DEFAULT 10)
RETURNS TABLE(freelancer_id uuid, user_id uuid, full_name text, username text, avatar text, skill text, ranking_score numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT f.id, f.user_id, p.full_name, p.username, p.profile_image_url,
         COALESCE(NULLIF(p.professional_title,''), f.skills[1], 'Freelancer'), COALESCE(f.ranking_score,0)
  FROM public.freelancers f
  JOIN public.profiles p ON p.id = f.user_id
  WHERE public.is_listed_freelancer(f.id) AND p.profile_image_url IS NOT NULL AND p.profile_image_url <> ''
  ORDER BY COALESCE(f.ranking_score,0) DESC, COALESCE(f.completed_orders,0) DESC, COALESCE(f.rating,0) DESC, f.id
  LIMIT LEAST(GREATEST(_limit,1),10);
$$;