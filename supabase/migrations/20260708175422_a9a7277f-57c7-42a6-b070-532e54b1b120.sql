
CREATE TABLE IF NOT EXISTS public.somadz_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  placement text NOT NULL CHECK (placement IN ('dashboard_banner','gig_price')),
  media_path text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image','video')),
  focal_x numeric NOT NULL DEFAULT 50,
  focal_y numeric NOT NULL DEFAULT 50,
  zoom numeric NOT NULL DEFAULT 1,
  cta_text text,
  cta_url text,
  cta_style text NOT NULL DEFAULT 'solid',
  cta_color text NOT NULL DEFAULT '#00A3FF',
  cta_size text NOT NULL DEFAULT 'md',
  cta_position text NOT NULL DEFAULT 'bottom-right',
  audience text NOT NULL DEFAULT 'all' CHECK (audience IN ('all','buyers','freelancers')),
  is_active boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.somadz_ads TO anon, authenticated;
GRANT ALL ON public.somadz_ads TO service_role;

ALTER TABLE public.somadz_ads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can read active ads" ON public.somadz_ads;
CREATE POLICY "public can read active ads"
  ON public.somadz_ads FOR SELECT
  USING (is_active = true OR public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "admins manage ads" ON public.somadz_ads;
CREATE POLICY "admins manage ads"
  ON public.somadz_ads FOR ALL
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

DROP TRIGGER IF EXISTS trg_somadz_ads_updated ON public.somadz_ads;
CREATE TRIGGER trg_somadz_ads_updated
  BEFORE UPDATE ON public.somadz_ads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DO $$ BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.somadz_ads;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

DROP POLICY IF EXISTS "public can read somadz media" ON storage.objects;
CREATE POLICY "public can read somadz media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'somadz-media');

DROP POLICY IF EXISTS "admins can upload somadz media" ON storage.objects;
CREATE POLICY "admins can upload somadz media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'somadz-media' AND public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "admins can update somadz media" ON storage.objects;
CREATE POLICY "admins can update somadz media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'somadz-media' AND public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "admins can delete somadz media" ON storage.objects;
CREATE POLICY "admins can delete somadz media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'somadz-media' AND public.is_admin_user(auth.uid()));
