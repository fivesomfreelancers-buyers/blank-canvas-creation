DROP POLICY IF EXISTS "Founders can view user reports" ON public.user_reports;
DROP POLICY IF EXISTS "Founders can update user reports" ON public.user_reports;

CREATE POLICY "Founders can view user reports" ON public.user_reports
  FOR SELECT TO authenticated USING (public.is_founder_user(auth.uid()));
CREATE POLICY "Founders can update user reports" ON public.user_reports
  FOR UPDATE TO authenticated USING (public.is_founder_user(auth.uid())) WITH CHECK (public.is_founder_user(auth.uid()));