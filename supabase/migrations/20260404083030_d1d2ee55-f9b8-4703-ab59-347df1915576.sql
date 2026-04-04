
-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.accepted_deliveries CASCADE;
DROP TABLE IF EXISTS public.buyer_support_tickets CASCADE;
DROP TABLE IF EXISTS public.freelancer_support_tickets CASCADE;

-- ✅ 11. FREELANCER SUPPORT TICKETS
CREATE TABLE public.freelancer_support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  category text DEFAULT 'general',
  status ticket_status DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.freelancer_support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Freelancers can create own tickets"
  ON public.freelancer_support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Freelancers can view own tickets"
  ON public.freelancer_support_tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ✅ 12. BUYER SUPPORT TICKETS
CREATE TABLE public.buyer_support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  category text DEFAULT 'general',
  status ticket_status DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.buyer_support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can create own tickets"
  ON public.buyer_support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Buyers can view own tickets"
  ON public.buyer_support_tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ✅ 13. ACCEPTED DELIVERIES
CREATE TABLE public.accepted_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  delivery_id uuid NOT NULL REFERENCES public.order_deliveries(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL,
  freelancer_id uuid NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  accepted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.accepted_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can accept deliveries"
  ON public.accepted_deliveries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Participants can view accepted deliveries"
  ON public.accepted_deliveries FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = freelancer_id);
