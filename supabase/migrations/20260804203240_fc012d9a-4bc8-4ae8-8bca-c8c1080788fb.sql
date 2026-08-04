-- Email must stay immutable, but enforce it with a trigger instead of an RLS
-- subquery that requires SELECT privilege on the (intentionally hidden) column.
CREATE OR REPLACE FUNCTION public.profiles_protect_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email AND NOT public.is_admin_user(auth.uid()) THEN
    NEW.email := OLD.email;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS profiles_protect_email ON public.profiles;
CREATE TRIGGER profiles_protect_email
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.profiles_protect_email();

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = ANY (ARRAY['user'::public.app_role, 'buyer'::public.app_role, 'freelancer'::public.app_role])
);