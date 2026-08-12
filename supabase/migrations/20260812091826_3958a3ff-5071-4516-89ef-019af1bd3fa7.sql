DROP POLICY IF EXISTS "Admins can read all conversations" ON public.conversations;
DROP POLICY IF EXISTS "Founders can read all conversations" ON public.conversations;
CREATE POLICY "Admins can read all conversations"
ON public.conversations FOR SELECT TO authenticated
USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can read all messages" ON public.messages;
DROP POLICY IF EXISTS "Founders can read all messages" ON public.messages;
CREATE POLICY "Admins can read all messages"
ON public.messages FOR SELECT TO authenticated
USING (public.is_admin_user(auth.uid()));