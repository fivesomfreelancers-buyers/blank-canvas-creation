-- Restore public marketplace read on freelancers (rating, verification, etc. are intentionally public)
DROP POLICY IF EXISTS "Anyone can view freelancers" ON public.freelancers;
CREATE POLICY "Anyone can view freelancers"
ON public.freelancers
FOR SELECT
USING (true);