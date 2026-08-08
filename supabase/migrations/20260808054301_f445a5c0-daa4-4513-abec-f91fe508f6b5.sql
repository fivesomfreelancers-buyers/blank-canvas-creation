-- 1. slugify helper
CREATE OR REPLACE FUNCTION public.slugify(_txt text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT trim(both '-' from
    regexp_replace(
      regexp_replace(lower(coalesce(_txt, '')), '[^a-z0-9]+', '-', 'g'),
      '-{2,}', '-', 'g'
    )
  )
$$;

-- 2. gigs.slug
ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS slug text;
CREATE UNIQUE INDEX IF NOT EXISTS gigs_slug_key ON public.gigs (slug);

CREATE OR REPLACE FUNCTION public.gigs_set_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base text;
  candidate text;
  n int := 1;
BEGIN
  IF NEW.slug IS NOT NULL AND NEW.slug <> '' AND
     (TG_OP = 'UPDATE' AND NEW.slug IS DISTINCT FROM OLD.slug) THEN
    -- explicit slug provided by owner: normalize it
    base := public.slugify(NEW.slug);
  ELSIF TG_OP = 'UPDATE' AND NEW.slug IS NOT NULL AND NEW.slug <> '' THEN
    RETURN NEW; -- keep existing slug stable across title edits
  ELSE
    base := public.slugify(NEW.title);
  END IF;

  IF base IS NULL OR base = '' THEN
    base := 'gig';
  END IF;
  base := left(base, 70);

  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.gigs g WHERE g.slug = candidate AND g.id <> NEW.id) LOOP
    n := n + 1;
    candidate := base || '-' || n;
  END LOOP;

  NEW.slug := candidate;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS gigs_set_slug_trg ON public.gigs;
CREATE TRIGGER gigs_set_slug_trg
BEFORE INSERT OR UPDATE ON public.gigs
FOR EACH ROW EXECUTE FUNCTION public.gigs_set_slug();

-- backfill existing gigs
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id FROM public.gigs WHERE slug IS NULL OR slug = '' LOOP
    UPDATE public.gigs SET slug = NULL WHERE id = r.id; -- trigger fills it
  END LOOP;
END $$;

-- 3. profiles.username
CREATE OR REPLACE FUNCTION public.profiles_set_username()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base text;
  candidate text;
  n int := 1;
BEGIN
  IF NEW.username IS NOT NULL AND NEW.username <> '' THEN
    base := public.slugify(NEW.username);
  ELSE
    base := public.slugify(coalesce(NEW.full_name, split_part(coalesce(NEW.email, ''), '@', 1)));
  END IF;

  IF base IS NULL OR base = '' THEN
    base := 'member';
  END IF;
  base := left(base, 40);

  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.profiles p WHERE lower(p.username) = candidate AND p.id <> NEW.id) LOOP
    n := n + 1;
    candidate := base || '-' || n;
  END LOOP;

  NEW.username := candidate;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_username_trg ON public.profiles;
CREATE TRIGGER profiles_set_username_trg
BEFORE INSERT OR UPDATE OF username, full_name ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.profiles_set_username();

-- backfill usernames
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE username IS NULL OR username = '' LOOP
    UPDATE public.profiles SET username = NULL WHERE id = r.id;
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_key ON public.profiles (lower(username));

-- 4. make sure public profile view exposes username (it already selects it) and gigs slug is readable
GRANT SELECT ON public.public_profiles TO anon, authenticated;
