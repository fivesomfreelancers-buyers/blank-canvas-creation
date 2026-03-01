
-- Drop existing app_role if needed and recreate with admin
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'admin';
  END IF;
END $$;

-- Create other enums (IF NOT EXISTS pattern via DO block)
DO $$ BEGIN
  CREATE TYPE public.gig_status AS ENUM ('active', 'paused', 'draft');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('pending', 'in_progress', 'delivered', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.delivery_status AS ENUM ('submitted', 'approved', 'revision_requested');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'resolved');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.verification_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.media_type AS ENUM ('image', 'video', 'document');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'buyer',
  full_name TEXT,
  username TEXT UNIQUE,
  email TEXT,
  profile_image_url TEXT,
  bio TEXT,
  professional_title TEXT,
  location TEXT,
  skills TEXT[] DEFAULT '{}',
  member_since TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- 4. Security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- 5. Freelancers
CREATE TABLE IF NOT EXISTS public.freelancers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  rating NUMERIC(3,2) DEFAULT 0,
  total_earnings NUMERIC(12,2) DEFAULT 0,
  completed_orders INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Buyers
CREATE TABLE IF NOT EXISTS public.buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Subcategories
CREATE TABLE IF NOT EXISTS public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Gigs
CREATE TABLE IF NOT EXISTS public.gigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id UUID REFERENCES public.freelancers(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT 'No description provided',
  category_id UUID REFERENCES public.categories(id),
  subcategory_id UUID REFERENCES public.subcategories(id),
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_time_days INTEGER DEFAULT 7,
  images TEXT[],
  thumbnail_url TEXT,
  status gig_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Gig media
CREATE TABLE IF NOT EXISTS public.gig_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID REFERENCES public.gigs(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_type media_type NOT NULL DEFAULT 'image',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID REFERENCES public.gigs(id),
  buyer_id UUID REFERENCES auth.users(id) NOT NULL,
  freelancer_id UUID REFERENCES public.freelancers(id) NOT NULL,
  status order_status DEFAULT 'pending',
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  requirements TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Order deliveries
CREATE TABLE IF NOT EXISTS public.order_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  delivery_message TEXT,
  delivery_file_url TEXT,
  status delivery_status DEFAULT 'submitted',
  delivered_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES auth.users(id) NOT NULL,
  freelancer_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) NOT NULL,
  message TEXT NOT NULL,
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. Gig reviews
CREATE TABLE IF NOT EXISTS public.gig_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID REFERENCES public.gigs(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 16. Wallets
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance NUMERIC(12,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 17. Withdrawals
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id UUID REFERENCES public.freelancers(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status withdrawal_status DEFAULT 'pending',
  bank_name TEXT,
  account_number TEXT,
  mobile_provider TEXT,
  mobile_number TEXT,
  requested_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- 18. Support tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status ticket_status DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 19. Verification documents
CREATE TABLE IF NOT EXISTS public.verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'id',
  document_url TEXT NOT NULL,
  personal_info JSONB,
  professional_info JSONB,
  note TEXT,
  status verification_status DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, location)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'buyer'),
    NEW.raw_user_meta_data->>'location'
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'buyer'));
  INSERT INTO public.wallets (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS gigs_updated_at ON public.gigs;
CREATE TRIGGER gigs_updated_at BEFORE UPDATE ON public.gigs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- RLS POLICIES (using DROP IF EXISTS pattern)
-- =============================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Freelancers
ALTER TABLE public.freelancers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view freelancers" ON public.freelancers;
CREATE POLICY "Anyone can view freelancers" ON public.freelancers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own freelancer" ON public.freelancers;
CREATE POLICY "Users can insert own freelancer" ON public.freelancers FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own freelancer" ON public.freelancers;
CREATE POLICY "Users can update own freelancer" ON public.freelancers FOR UPDATE USING (auth.uid() = user_id);

-- Buyers
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view buyers" ON public.buyers;
CREATE POLICY "Anyone can view buyers" ON public.buyers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own buyer" ON public.buyers;
CREATE POLICY "Users can insert own buyer" ON public.buyers FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own buyer" ON public.buyers;
CREATE POLICY "Users can update own buyer" ON public.buyers FOR UPDATE USING (auth.uid() = user_id);

-- Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);

-- Subcategories
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view subcategories" ON public.subcategories;
CREATE POLICY "Anyone can view subcategories" ON public.subcategories FOR SELECT USING (true);

-- Gigs
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active gigs" ON public.gigs;
CREATE POLICY "Anyone can view active gigs" ON public.gigs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Freelancers can insert own gigs" ON public.gigs;
CREATE POLICY "Freelancers can insert own gigs" ON public.gigs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.freelancers WHERE id = freelancer_id AND user_id = auth.uid())
);
DROP POLICY IF EXISTS "Freelancers can update own gigs" ON public.gigs;
CREATE POLICY "Freelancers can update own gigs" ON public.gigs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.freelancers WHERE id = freelancer_id AND user_id = auth.uid())
);
DROP POLICY IF EXISTS "Freelancers can delete own gigs" ON public.gigs;
CREATE POLICY "Freelancers can delete own gigs" ON public.gigs FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.freelancers WHERE id = freelancer_id AND user_id = auth.uid())
);

-- Gig media
ALTER TABLE public.gig_media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view gig media" ON public.gig_media;
CREATE POLICY "Anyone can view gig media" ON public.gig_media FOR SELECT USING (true);
DROP POLICY IF EXISTS "Freelancers can manage gig media" ON public.gig_media;
CREATE POLICY "Freelancers can manage gig media" ON public.gig_media FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.gigs g JOIN public.freelancers f ON g.freelancer_id = f.id WHERE g.id = gig_id AND f.user_id = auth.uid())
);

-- Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (
  auth.uid() = buyer_id OR EXISTS (SELECT 1 FROM public.freelancers WHERE id = freelancer_id AND user_id = auth.uid())
);
DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;
CREATE POLICY "Buyers can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
DROP POLICY IF EXISTS "Participants can update orders" ON public.orders;
CREATE POLICY "Participants can update orders" ON public.orders FOR UPDATE USING (
  auth.uid() = buyer_id OR EXISTS (SELECT 1 FROM public.freelancers WHERE id = freelancer_id AND user_id = auth.uid())
);

-- Order deliveries
ALTER TABLE public.order_deliveries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Order participants can view deliveries" ON public.order_deliveries;
CREATE POLICY "Order participants can view deliveries" ON public.order_deliveries FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (
    o.buyer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.freelancers f WHERE f.id = o.freelancer_id AND f.user_id = auth.uid())
  ))
);
DROP POLICY IF EXISTS "Freelancers can insert deliveries" ON public.order_deliveries;
CREATE POLICY "Freelancers can insert deliveries" ON public.order_deliveries FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o JOIN public.freelancers f ON o.freelancer_id = f.id WHERE o.id = order_id AND f.user_id = auth.uid())
);

-- Conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
CREATE POLICY "Participants can view conversations" ON public.conversations FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = freelancer_id);
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = freelancer_id);

-- Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
CREATE POLICY "Participants can view messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Gig reviews
ALTER TABLE public.gig_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.gig_reviews;
CREATE POLICY "Anyone can view reviews" ON public.gig_reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Buyers can create reviews" ON public.gig_reviews;
CREATE POLICY "Buyers can create reviews" ON public.gig_reviews FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Wallets
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets;
CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own wallet" ON public.wallets;
CREATE POLICY "Users can update own wallet" ON public.wallets FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "System can insert wallets" ON public.wallets;
CREATE POLICY "System can insert wallets" ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Withdrawals
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Freelancers can view own withdrawals" ON public.withdrawals;
CREATE POLICY "Freelancers can view own withdrawals" ON public.withdrawals FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.freelancers WHERE id = freelancer_id AND user_id = auth.uid())
);
DROP POLICY IF EXISTS "Freelancers can create withdrawals" ON public.withdrawals;
CREATE POLICY "Freelancers can create withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.freelancers WHERE id = freelancer_id AND user_id = auth.uid())
);

-- Support tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Verification documents
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own verifications" ON public.verification_documents;
CREATE POLICY "Users can view own verifications" ON public.verification_documents FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can submit verifications" ON public.verification_documents;
CREATE POLICY "Users can submit verifications" ON public.verification_documents FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- REALTIME
-- =============================================
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.order_deliveries;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================
-- STORAGE BUCKETS
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('gig-images', 'gig-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('gig-media', 'gig-media', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('verification-docs', 'verification-docs', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('delivery-files', 'delivery-files', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('message-attachments', 'message-attachments', false) ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;
CREATE POLICY "Anyone can view profile images" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');
DROP POLICY IF EXISTS "Users can upload profile images" ON storage.objects;
CREATE POLICY "Users can upload profile images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);
DROP POLICY IF EXISTS "Users can update profile images" ON storage.objects;
CREATE POLICY "Users can update profile images" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Anyone can view gig images" ON storage.objects;
CREATE POLICY "Anyone can view gig images" ON storage.objects FOR SELECT USING (bucket_id = 'gig-images');
DROP POLICY IF EXISTS "Users can upload gig images" ON storage.objects;
CREATE POLICY "Users can upload gig images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gig-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Anyone can view gig media" ON storage.objects;
CREATE POLICY "Anyone can view gig media" ON storage.objects FOR SELECT USING (bucket_id = 'gig-media');
DROP POLICY IF EXISTS "Users can upload gig media" ON storage.objects;
CREATE POLICY "Users can upload gig media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gig-media' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can view own verification docs" ON storage.objects;
CREATE POLICY "Users can view own verification docs" ON storage.objects FOR SELECT USING (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
DROP POLICY IF EXISTS "Users can upload verification docs" ON storage.objects;
CREATE POLICY "Users can upload verification docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Order participants can view delivery files" ON storage.objects;
CREATE POLICY "Order participants can view delivery files" ON storage.objects FOR SELECT USING (bucket_id = 'delivery-files' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Users can upload delivery files" ON storage.objects;
CREATE POLICY "Users can upload delivery files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'delivery-files' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Message participants can view attachments" ON storage.objects;
CREATE POLICY "Message participants can view attachments" ON storage.objects FOR SELECT USING (bucket_id = 'message-attachments' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Users can upload message attachments" ON storage.objects;
CREATE POLICY "Users can upload message attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'message-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- SEED: Categories
-- =============================================
INSERT INTO public.categories (name) VALUES
  ('Logo & Brand Design'),
  ('Web Development'),
  ('Mobile App Development'),
  ('Video Editing'),
  ('Content Writing'),
  ('Digital Marketing'),
  ('UI/UX Design'),
  ('Graphic Design'),
  ('Translation'),
  ('Data Entry')
ON CONFLICT (name) DO NOTHING;
