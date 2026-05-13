
-- admin_announcements
CREATE TABLE IF NOT EXISTS public.admin_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  audience text NOT NULL DEFAULT 'all',
  severity text NOT NULL DEFAULT 'info',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read announcements" ON public.admin_announcements;
CREATE POLICY "Anyone can read announcements" ON public.admin_announcements FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can create announcements" ON public.admin_announcements;
CREATE POLICY "Admins can create announcements" ON public.admin_announcements FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can delete announcements" ON public.admin_announcements;
CREATE POLICY "Admins can delete announcements" ON public.admin_announcements FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- admin_action_logs
CREATE TABLE IF NOT EXISTS public.admin_action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_table text,
  target_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_action_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read action logs" ON public.admin_action_logs;
CREATE POLICY "Admins can read action logs" ON public.admin_action_logs FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can insert action logs" ON public.admin_action_logs;
CREATE POLICY "Admins can insert action logs" ON public.admin_action_logs FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND admin_id = auth.uid());

-- support_ticket_replies
CREATE TABLE IF NOT EXISTS public.support_ticket_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL,
  ticket_table text NOT NULL,
  sender_id uuid NOT NULL,
  is_admin boolean NOT NULL DEFAULT false,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.support_ticket_replies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read all replies" ON public.support_ticket_replies;
CREATE POLICY "Admins can read all replies" ON public.support_ticket_replies FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Senders can read own replies" ON public.support_ticket_replies;
CREATE POLICY "Senders can read own replies" ON public.support_ticket_replies FOR SELECT TO authenticated USING (sender_id = auth.uid());
DROP POLICY IF EXISTS "Admins and senders can insert replies" ON public.support_ticket_replies;
CREATE POLICY "Admins and senders can insert replies" ON public.support_ticket_replies FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());

-- Admin update on support tickets
DROP POLICY IF EXISTS "Admins can update support_tickets" ON public.support_tickets;
CREATE POLICY "Admins can update support_tickets" ON public.support_tickets FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can update buyer_support_tickets" ON public.buyer_support_tickets;
CREATE POLICY "Admins can update buyer_support_tickets" ON public.buyer_support_tickets FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can update freelancer_support_tickets" ON public.freelancer_support_tickets;
CREATE POLICY "Admins can update freelancer_support_tickets" ON public.freelancer_support_tickets FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin read all support tickets
DROP POLICY IF EXISTS "Admins can read all support_tickets" ON public.support_tickets;
CREATE POLICY "Admins can read all support_tickets" ON public.support_tickets FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can read all buyer_support_tickets" ON public.buyer_support_tickets;
CREATE POLICY "Admins can read all buyer_support_tickets" ON public.buyer_support_tickets FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can read all freelancer_support_tickets" ON public.freelancer_support_tickets;
CREATE POLICY "Admins can read all freelancer_support_tickets" ON public.freelancer_support_tickets FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin read conversations & messages
DROP POLICY IF EXISTS "Admins can read all conversations" ON public.conversations;
CREATE POLICY "Admins can read all conversations" ON public.conversations FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can read all messages" ON public.messages;
CREATE POLICY "Admins can read all messages" ON public.messages FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin delete reviews
DROP POLICY IF EXISTS "Admins can delete reviews" ON public.gig_reviews;
CREATE POLICY "Admins can delete reviews" ON public.gig_reviews FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin manage subcategories
DROP POLICY IF EXISTS "Admins can insert subcategories" ON public.subcategories;
CREATE POLICY "Admins can insert subcategories" ON public.subcategories FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can update subcategories" ON public.subcategories;
CREATE POLICY "Admins can update subcategories" ON public.subcategories FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can delete subcategories" ON public.subcategories;
CREATE POLICY "Admins can delete subcategories" ON public.subcategories FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
