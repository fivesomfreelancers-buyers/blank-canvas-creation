
CREATE TABLE public.gig_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id uuid NOT NULL REFERENCES public.gigs(id) ON DELETE CASCADE,
  package_type text NOT NULL CHECK (package_type IN ('basic', 'standard', 'premium')),
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  delivery_time text,
  revisions text,
  features text[] DEFAULT '{}'::text[],
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(gig_id, package_type)
);

ALTER TABLE public.gig_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gig packages" ON public.gig_packages FOR SELECT USING (true);

CREATE POLICY "Freelancers can insert gig packages" ON public.gig_packages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM gigs g JOIN freelancers f ON g.freelancer_id = f.id
    WHERE g.id = gig_packages.gig_id AND f.user_id = auth.uid()
  )
);

CREATE POLICY "Freelancers can update gig packages" ON public.gig_packages FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM gigs g JOIN freelancers f ON g.freelancer_id = f.id
    WHERE g.id = gig_packages.gig_id AND f.user_id = auth.uid()
  )
);

CREATE POLICY "Freelancers can delete gig packages" ON public.gig_packages FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM gigs g JOIN freelancers f ON g.freelancer_id = f.id
    WHERE g.id = gig_packages.gig_id AND f.user_id = auth.uid()
  )
);
