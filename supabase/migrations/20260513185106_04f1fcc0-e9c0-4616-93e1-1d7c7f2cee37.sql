ALTER TABLE public.freelancers
  ADD COLUMN IF NOT EXISTS verification_removed_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_removal_reason text,
  ADD COLUMN IF NOT EXISTS verification_removed_by uuid;

CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin'::public.app_role)
      OR public.has_role(_user_id, 'super_admin'::public.app_role)
$$;

CREATE OR REPLACE FUNCTION public.enforce_admin_verification_control()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (OLD.is_verified IS DISTINCT FROM NEW.is_verified)
     OR (OLD.verified_at IS DISTINCT FROM NEW.verified_at)
     OR (OLD.verification_removed_at IS DISTINCT FROM NEW.verification_removed_at)
     OR (OLD.verification_removal_reason IS DISTINCT FROM NEW.verification_removal_reason)
     OR (OLD.verification_removed_by IS DISTINCT FROM NEW.verification_removed_by) THEN
    IF NOT public.is_admin_user(auth.uid()) THEN
      RAISE EXCEPTION 'Only admins can change freelancer verification status';
    END IF;
  END IF;

  IF NEW.is_verified = true THEN
    NEW.verification_removed_at := NULL;
    NEW.verification_removal_reason := NULL;
    NEW.verification_removed_by := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_admin_verification_control_trigger ON public.freelancers;
CREATE TRIGGER enforce_admin_verification_control_trigger
BEFORE UPDATE ON public.freelancers
FOR EACH ROW
EXECUTE FUNCTION public.enforce_admin_verification_control();

DROP POLICY IF EXISTS "Admins can update freelancer verification" ON public.freelancers;
CREATE POLICY "Admins can update freelancer verification"
ON public.freelancers
FOR UPDATE
TO authenticated
USING (public.is_admin_user(auth.uid()))
WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all verification documents" ON public.verification_documents;
CREATE POLICY "Admins can view all verification documents"
ON public.verification_documents
FOR SELECT
TO authenticated
USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can update verification documents" ON public.verification_documents;
CREATE POLICY "Admins can update verification documents"
ON public.verification_documents
FOR UPDATE
TO authenticated
USING (public.is_admin_user(auth.uid()))
WITH CHECK (public.is_admin_user(auth.uid()));

DROP VIEW IF EXISTS public.public_freelancers;
CREATE VIEW public.public_freelancers
WITH (security_invoker=on) AS
SELECT id, user_id, bio, skills, rating, completed_orders, is_verified, is_featured, created_at
FROM public.freelancers;
GRANT SELECT ON public.public_freelancers TO anon, authenticated;