DROP POLICY IF EXISTS "Participants can view own disputes" ON public.disputes;

CREATE POLICY "Participants can view own disputes"
ON public.disputes
FOR SELECT
USING (
  auth.uid() = buyer_id
  OR EXISTS (SELECT 1 FROM public.freelancers f WHERE f.id = disputes.freelancer_id AND f.user_id = auth.uid())
  OR public.is_admin_user(auth.uid())
);