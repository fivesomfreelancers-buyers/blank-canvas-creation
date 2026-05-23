
-- 1. Buyers
DROP POLICY IF EXISTS "Authenticated can view buyers" ON public.buyers;
DROP POLICY IF EXISTS "Admins can view all buyers" ON public.buyers;
CREATE POLICY "Admins can view all buyers" ON public.buyers
  FOR SELECT TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- 2. Freelancers - revoke anon column access
REVOKE SELECT (total_earnings, verification_removal_reason, verification_removed_by)
  ON public.freelancers FROM anon;

-- 3. Platform settings DELETE
DROP POLICY IF EXISTS "Admins can delete platform settings" ON public.platform_settings;
CREATE POLICY "Admins can delete platform settings" ON public.platform_settings
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 4. Realtime authorization for dispute:* and system:* topics
DROP POLICY IF EXISTS "Dispute participants can read dispute realtime topics" ON realtime.messages;
CREATE POLICY "Dispute participants can read dispute realtime topics"
  ON realtime.messages FOR SELECT TO authenticated
  USING (
    realtime.topic() LIKE 'dispute:%'
    AND public.is_dispute_participant(
      split_part(realtime.topic(), ':', 2)::uuid,
      auth.uid()
    )
  );

DROP POLICY IF EXISTS "Dispute participants can broadcast on dispute realtime topics" ON realtime.messages;
CREATE POLICY "Dispute participants can broadcast on dispute realtime topics"
  ON realtime.messages FOR INSERT TO authenticated
  WITH CHECK (
    realtime.topic() LIKE 'dispute:%'
    AND public.is_dispute_participant(
      split_part(realtime.topic(), ':', 2)::uuid,
      auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can read own system conversation realtime topics" ON realtime.messages;
CREATE POLICY "Users can read own system conversation realtime topics"
  ON realtime.messages FOR SELECT TO authenticated
  USING (
    realtime.topic() LIKE 'system:%'
    AND EXISTS (
      SELECT 1 FROM public.system_conversations sc
      WHERE sc.id::text = split_part(realtime.topic(), ':', 2)
        AND (sc.user_id = auth.uid() OR public.is_admin_user(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can broadcast on own system conversation realtime topics" ON realtime.messages;
CREATE POLICY "Users can broadcast on own system conversation realtime topics"
  ON realtime.messages FOR INSERT TO authenticated
  WITH CHECK (
    realtime.topic() LIKE 'system:%'
    AND EXISTS (
      SELECT 1 FROM public.system_conversations sc
      WHERE sc.id::text = split_part(realtime.topic(), ':', 2)
        AND (sc.user_id = auth.uid() OR public.is_admin_user(auth.uid()))
    )
  );
