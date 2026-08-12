
-- 1. Effective role resolver
CREATE OR REPLACE FUNCTION public.effective_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r FROM (
    SELECT ur.role AS r,
      CASE ur.role
        WHEN 'super_admin' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'founder' THEN 3
        WHEN 'freelancer' THEN 4
        WHEN 'buyer' THEN 5
        ELSE 6
      END AS p
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
  ) x
  ORDER BY p
  LIMIT 1;
$$;

-- 2. Sync helper
CREATE OR REPLACE FUNCTION public.sync_profile_role(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE eff app_role;
BEGIN
  eff := public.effective_user_role(_user_id);
  IF eff IS NULL THEN
    eff := 'user';
  END IF;
  UPDATE public.profiles SET role = eff, updated_at = now()
  WHERE id = _user_id AND role IS DISTINCT FROM eff;
END;
$$;

-- 3. Keep profiles.role in sync with user_roles
CREATE OR REPLACE FUNCTION public.user_roles_sync_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.sync_profile_role(COALESCE(NEW.user_id, OLD.user_id));
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS user_roles_sync_profile_trg ON public.user_roles;
CREATE TRIGGER user_roles_sync_profile_trg
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.user_roles_sync_profile();

-- 4. Creating a gig proves the account is a freelancer
CREATE OR REPLACE FUNCTION public.gigs_ensure_freelancer_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE uid uuid;
BEGIN
  SELECT user_id INTO uid FROM public.freelancers WHERE id = NEW.freelancer_id;
  IF uid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'freelancer')
    ON CONFLICT (user_id, role) DO NOTHING;
    DELETE FROM public.user_roles WHERE user_id = uid AND role = 'user';
    PERFORM public.sync_profile_role(uid);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS gigs_ensure_freelancer_role_trg ON public.gigs;
CREATE TRIGGER gigs_ensure_freelancer_role_trg
AFTER INSERT ON public.gigs
FOR EACH ROW EXECUTE FUNCTION public.gigs_ensure_freelancer_role();

-- 5. Backfill: accounts with a freelancer record AND at least one gig are real freelancers
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT f.user_id, 'freelancer'::app_role
FROM public.freelancers f
JOIN public.gigs g ON g.freelancer_id = f.id
ON CONFLICT (user_id, role) DO NOTHING;

DELETE FROM public.user_roles ur
WHERE ur.role = 'user'
  AND EXISTS (
    SELECT 1 FROM public.user_roles o
    WHERE o.user_id = ur.user_id AND o.role IN ('freelancer','buyer')
  );

-- 6. Re-sync every profile role from the source of truth
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id FROM public.profiles LOOP
    PERFORM public.sync_profile_role(r.id);
  END LOOP;
END $$;
