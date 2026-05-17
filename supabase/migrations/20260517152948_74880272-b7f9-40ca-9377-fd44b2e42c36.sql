
-- 1) freelancers.total_earnings — hide from anon
REVOKE SELECT (total_earnings) ON public.freelancers FROM anon;
REVOKE SELECT (total_earnings) ON public.freelancers FROM PUBLIC;
GRANT  SELECT (total_earnings) ON public.freelancers TO authenticated;

-- 2) profiles — block self-update of email/role
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND email IS NOT DISTINCT FROM (SELECT p.email FROM public.profiles p WHERE p.id = profiles.id)
  AND role  IS NOT DISTINCT FROM (SELECT p.role  FROM public.profiles p WHERE p.id = profiles.id)
);

-- 3) buyers — authenticated only
DROP POLICY IF EXISTS "Anyone can view buyers" ON public.buyers;
DROP POLICY IF EXISTS "Authenticated can view buyers" ON public.buyers;
CREATE POLICY "Authenticated can view buyers"
ON public.buyers FOR SELECT TO authenticated USING (true);

-- 4) platform_settings — admin-only read
DROP POLICY IF EXISTS "Anyone can read platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Admins can read platform settings" ON public.platform_settings;
CREATE POLICY "Admins can read platform settings"
ON public.platform_settings FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 5) support_ticket_replies — scope to ticket ownership
CREATE OR REPLACE FUNCTION public.user_owns_support_ticket(_ticket_table text, _ticket_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _owner uuid;
BEGIN
  IF _ticket_table = 'support_tickets' THEN
    SELECT user_id INTO _owner FROM public.support_tickets WHERE id = _ticket_id;
  ELSIF _ticket_table = 'buyer_support_tickets' THEN
    SELECT user_id INTO _owner FROM public.buyer_support_tickets WHERE id = _ticket_id;
  ELSIF _ticket_table = 'freelancer_support_tickets' THEN
    SELECT user_id INTO _owner FROM public.freelancer_support_tickets WHERE id = _ticket_id;
  ELSE RETURN false;
  END IF;
  RETURN _owner = _user_id;
END $$;

DROP POLICY IF EXISTS "Senders can read own replies" ON public.support_ticket_replies;
DROP POLICY IF EXISTS "Admins and senders can insert replies" ON public.support_ticket_replies;
DROP POLICY IF EXISTS "Ticket participants can read replies" ON public.support_ticket_replies;
DROP POLICY IF EXISTS "Ticket participants can insert replies" ON public.support_ticket_replies;

CREATE POLICY "Ticket participants can read replies"
ON public.support_ticket_replies FOR SELECT TO authenticated
USING (
  public.is_admin_user(auth.uid())
  OR public.user_owns_support_ticket(ticket_table, ticket_id, auth.uid())
);

CREATE POLICY "Ticket participants can insert replies"
ON public.support_ticket_replies FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND (
    public.is_admin_user(auth.uid())
    OR public.user_owns_support_ticket(ticket_table, ticket_id, auth.uid())
  )
);
