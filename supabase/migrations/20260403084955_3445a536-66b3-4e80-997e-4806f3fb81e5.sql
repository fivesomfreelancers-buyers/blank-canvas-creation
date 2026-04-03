
-- Add payment tracking columns to orders
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS package_name text,
  ADD COLUMN IF NOT EXISTS payment_proof_url text;

-- Create order_requirements table for files, instructions, and links
CREATE TABLE public.order_requirements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  instructions text,
  external_links text[] DEFAULT '{}'::text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create order_requirement_files table
CREATE TABLE public.order_requirement_files (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_requirement_id uuid NOT NULL REFERENCES public.order_requirements(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  file_type text,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS for order_requirements: buyer who owns the order + freelancer assigned
ALTER TABLE public.order_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_requirement_files ENABLE ROW LEVEL SECURITY;

-- Buyer can insert requirements for their own orders
CREATE POLICY "Buyer can insert requirements"
  ON public.order_requirements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_requirements.order_id AND orders.buyer_id = auth.uid())
  );

-- Buyer and freelancer can view requirements
CREATE POLICY "Order participants can view requirements"
  ON public.order_requirements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_requirements.order_id
      AND (
        o.buyer_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.freelancers f WHERE f.id = o.freelancer_id AND f.user_id = auth.uid())
      )
    )
  );

-- Buyer can update own requirements
CREATE POLICY "Buyer can update requirements"
  ON public.order_requirements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_requirements.order_id AND orders.buyer_id = auth.uid())
  );

-- Requirement files: insert by buyer
CREATE POLICY "Buyer can insert requirement files"
  ON public.order_requirement_files FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.order_requirements r
      JOIN public.orders o ON o.id = r.order_id
      WHERE r.id = order_requirement_files.order_requirement_id AND o.buyer_id = auth.uid()
    )
  );

-- Requirement files: view by participants
CREATE POLICY "Order participants can view requirement files"
  ON public.order_requirement_files FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.order_requirements r
      JOIN public.orders o ON o.id = r.order_id
      WHERE r.id = order_requirement_files.order_requirement_id
      AND (
        o.buyer_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.freelancers f WHERE f.id = o.freelancer_id AND f.user_id = auth.uid())
      )
    )
  );

-- Storage bucket for order requirement files
INSERT INTO storage.buckets (id, name, public) VALUES ('order-requirements', 'order-requirements', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for order-requirements bucket
CREATE POLICY "Authenticated users can upload requirement files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'order-requirements');

CREATE POLICY "Authenticated users can view requirement files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'order-requirements');
