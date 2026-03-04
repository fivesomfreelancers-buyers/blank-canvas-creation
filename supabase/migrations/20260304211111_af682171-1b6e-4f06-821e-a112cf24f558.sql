
CREATE TABLE public.freelancer_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id uuid NOT NULL REFERENCES public.freelancers(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.freelancer_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view freelancer FAQs"
ON public.freelancer_faqs FOR SELECT
USING (true);

CREATE POLICY "Freelancers can insert own FAQs"
ON public.freelancer_faqs FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.freelancers
  WHERE freelancers.id = freelancer_faqs.freelancer_id
  AND freelancers.user_id = auth.uid()
));

CREATE POLICY "Freelancers can update own FAQs"
ON public.freelancer_faqs FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.freelancers
  WHERE freelancers.id = freelancer_faqs.freelancer_id
  AND freelancers.user_id = auth.uid()
));

CREATE POLICY "Freelancers can delete own FAQs"
ON public.freelancer_faqs FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.freelancers
  WHERE freelancers.id = freelancer_faqs.freelancer_id
  AND freelancers.user_id = auth.uid()
));
