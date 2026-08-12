-- Idempotent Founder access for Gigs & Users management (admin policies untouched)

DROP POLICY IF EXISTS "Founders can view all gigs" ON public.gigs;
DROP POLICY IF EXISTS "Founders can update any gig" ON public.gigs;
DROP POLICY IF EXISTS "Founders can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Founders can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Founders can view all freelancers" ON public.freelancers;
DROP POLICY IF EXISTS "Founders can update freelancers" ON public.freelancers;
DROP POLICY IF EXISTS "Founders can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Founders can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Founders can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Founders can delete roles" ON public.user_roles;

CREATE POLICY "Founders can view all gigs" ON public.gigs
FOR SELECT TO authenticated USING (public.is_founder_user(auth.uid()));

CREATE POLICY "Founders can update any gig" ON public.gigs
FOR UPDATE TO authenticated
USING (public.is_founder_user(auth.uid()))
WITH CHECK (public.is_founder_user(auth.uid()));

CREATE POLICY "Founders can view all profiles" ON public.profiles
FOR SELECT TO authenticated USING (public.is_founder_user(auth.uid()));

CREATE POLICY "Founders can update all profiles" ON public.profiles
FOR UPDATE TO authenticated
USING (public.is_founder_user(auth.uid()))
WITH CHECK (public.is_founder_user(auth.uid()));

CREATE POLICY "Founders can view all freelancers" ON public.freelancers
FOR SELECT TO authenticated USING (public.is_founder_user(auth.uid()));

CREATE POLICY "Founders can update freelancers" ON public.freelancers
FOR UPDATE TO authenticated
USING (public.is_founder_user(auth.uid()))
WITH CHECK (public.is_founder_user(auth.uid()));

CREATE POLICY "Founders can view all roles" ON public.user_roles
FOR SELECT TO authenticated USING (public.is_founder_user(auth.uid()));

CREATE POLICY "Founders can assign roles" ON public.user_roles
FOR INSERT TO authenticated WITH CHECK (public.is_founder_user(auth.uid()));

CREATE POLICY "Founders can update roles" ON public.user_roles
FOR UPDATE TO authenticated
USING (public.is_founder_user(auth.uid()))
WITH CHECK (public.is_founder_user(auth.uid()));

CREATE POLICY "Founders can delete roles" ON public.user_roles
FOR DELETE TO authenticated USING (public.is_founder_user(auth.uid()));