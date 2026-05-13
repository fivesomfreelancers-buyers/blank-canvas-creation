ALTER TABLE public.gigs 
  ADD COLUMN IF NOT EXISTS category_slug text,
  ADD COLUMN IF NOT EXISTS subcategory_slug text;

CREATE INDEX IF NOT EXISTS idx_gigs_category_slug ON public.gigs(category_slug);
CREATE INDEX IF NOT EXISTS idx_gigs_subcategory_slug ON public.gigs(subcategory_slug);