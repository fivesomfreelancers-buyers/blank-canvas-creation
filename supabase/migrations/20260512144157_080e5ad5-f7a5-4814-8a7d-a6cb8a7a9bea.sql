
ALTER TABLE public.freelancers
  ADD COLUMN IF NOT EXISTS years_experience text,
  ADD COLUMN IF NOT EXISTS education_level text,
  ADD COLUMN IF NOT EXISTS software_tools jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS professional_title text;

CREATE TABLE IF NOT EXISTS public.freelancer_portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id uuid NOT NULL,
  media_url text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image','video')),
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.freelancer_portfolio ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='freelancer_portfolio' AND policyname='Anyone can view portfolio') THEN
    CREATE POLICY "Anyone can view portfolio" ON public.freelancer_portfolio FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='freelancer_portfolio' AND policyname='Owner can insert portfolio') THEN
    CREATE POLICY "Owner can insert portfolio" ON public.freelancer_portfolio FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM public.freelancers f WHERE f.id = freelancer_portfolio.freelancer_id AND f.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='freelancer_portfolio' AND policyname='Owner can update portfolio') THEN
    CREATE POLICY "Owner can update portfolio" ON public.freelancer_portfolio FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM public.freelancers f WHERE f.id = freelancer_portfolio.freelancer_id AND f.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='freelancer_portfolio' AND policyname='Owner can delete portfolio') THEN
    CREATE POLICY "Owner can delete portfolio" ON public.freelancer_portfolio FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM public.freelancers f WHERE f.id = freelancer_portfolio.freelancer_id AND f.user_id = auth.uid()));
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-portfolio', 'verification-portfolio', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public can view verification portfolio') THEN
    CREATE POLICY "Public can view verification portfolio" ON storage.objects FOR SELECT USING (bucket_id = 'verification-portfolio');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Owner can upload verification portfolio') THEN
    CREATE POLICY "Owner can upload verification portfolio" ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'verification-portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Owner can update verification portfolio') THEN
    CREATE POLICY "Owner can update verification portfolio" ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'verification-portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Owner can delete verification portfolio') THEN
    CREATE POLICY "Owner can delete verification portfolio" ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'verification-portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;
