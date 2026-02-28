-- Create enums
CREATE TYPE public.user_role AS ENUM ('freelancer', 'buyer');
CREATE TYPE public.gig_status AS ENUM ('draft', 'active', 'paused', 'deleted');
CREATE TYPE public.order_status AS ENUM ('pending', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed');
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'processing', 'completed', 'rejected');
CREATE TYPE public.verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.document_type AS ENUM ('id', 'bank_statement', 'proof_of_address', 'business_license');
CREATE TYPE public.support_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.notification_type AS ENUM ('order', 'message', 'review', 'withdrawal', 'verification', 'system');
CREATE TYPE public.experience_level AS ENUM ('beginner', 'intermediate', 'expert');

-- ============================================
-- CORE TABLES
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role public.user_role NOT NULL,
  profile_image_url TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Freelancers table
CREATE TABLE public.freelancers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  experience_level public.experience_level DEFAULT 'beginner',
  hourly_rate DECIMAL(10, 2),
  portfolio_links TEXT[] DEFAULT '{}',
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  completed_orders INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Buyers table
CREATE TABLE public.buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  business_name TEXT,
  business_type TEXT,
  project_requirements TEXT,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- FUNCTIONALITY TABLES
-- ============================================

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Gigs table
CREATE TABLE public.gigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id UUID REFERENCES public.freelancers(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  images TEXT[] DEFAULT '{}',
  base_price DECIMAL(10, 2) NOT NULL,
  delivery_time_days INTEGER NOT NULL,
  status public.gig_status DEFAULT 'draft' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID REFERENCES public.gigs(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES public.buyers(id) ON DELETE SET NULL NOT NULL,
  freelancer_id UUID REFERENCES public.freelancers(id) ON DELETE SET NULL NOT NULL,
  status public.order_status DEFAULT 'pending' NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  delivery_files TEXT[] DEFAULT '{}',
  requirements TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Withdrawals table
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id UUID REFERENCES public.freelancers(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  card_type TEXT,
  status public.withdrawal_status DEFAULT 'pending' NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  processed_at TIMESTAMPTZ,
  notes TEXT
);

-- Verification documents table
CREATE TABLE public.verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  document_type public.document_type NOT NULL,
  document_url TEXT NOT NULL,
  status public.verification_status DEFAULT 'pending' NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT
);

-- Support requests table
CREATE TABLE public.support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT,
  status public.support_status DEFAULT 'open' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- RELATION TABLES
-- ============================================

-- Freelancer-Buyer connections table
CREATE TABLE public.freelancer_buyer_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id UUID REFERENCES public.freelancers(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.buyers(id) ON DELETE CASCADE NOT NULL,
  first_order_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_order_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  total_orders INTEGER DEFAULT 0,
  UNIQUE(freelancer_id, buyer_id)
);

-- Gig reviews table
CREATE TABLE public.gig_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID REFERENCES public.gigs(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.buyers(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(order_id)
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_freelancers_user_id ON public.freelancers(user_id);
CREATE INDEX idx_buyers_user_id ON public.buyers(user_id);
CREATE INDEX idx_gigs_freelancer_id ON public.gigs(freelancer_id);
CREATE INDEX idx_gigs_category_id ON public.gigs(category_id);
CREATE INDEX idx_gigs_status ON public.gigs(status);
CREATE INDEX idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX idx_orders_freelancer_id ON public.orders(freelancer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_freelancers_updated_at BEFORE UPDATE ON public.freelancers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_buyers_updated_at BEFORE UPDATE ON public.buyers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gigs_updated_at BEFORE UPDATE ON public.gigs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_requests_updated_at BEFORE UPDATE ON public.support_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'buyer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_buyer_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gig_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Freelancers policies
CREATE POLICY "Freelancer profiles are viewable by everyone" ON public.freelancers
  FOR SELECT USING (true);

CREATE POLICY "Freelancers can insert their own profile" ON public.freelancers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Freelancers can update their own profile" ON public.freelancers
  FOR UPDATE USING (auth.uid() = user_id);

-- Buyers policies
CREATE POLICY "Buyer profiles are viewable by authenticated users" ON public.buyers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Buyers can insert their own profile" ON public.buyers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Buyers can update their own profile" ON public.buyers
  FOR UPDATE USING (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (true);

-- Gigs policies
CREATE POLICY "Active gigs are viewable by everyone" ON public.gigs
  FOR SELECT USING (status = 'active' OR EXISTS (
    SELECT 1 FROM public.freelancers WHERE id = gigs.freelancer_id AND user_id = auth.uid()
  ));

CREATE POLICY "Freelancers can insert their own gigs" ON public.gigs
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.freelancers WHERE id = freelancer_id AND user_id = auth.uid()
  ));

CREATE POLICY "Freelancers can update their own gigs" ON public.gigs
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.freelancers WHERE id = freelancer_id AND user_id = auth.uid()
  ));

CREATE POLICY "Freelancers can delete their own gigs" ON public.gigs
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.freelancers WHERE id = freelancer_id AND user_id = auth.uid()
  ));

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.buyers WHERE id = buyer_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.freelancers WHERE id = freelancer_id AND user_id = auth.uid())
  );

CREATE POLICY "Buyers can create orders" ON public.orders
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.buyers WHERE id = buyer_id AND user_id = auth.uid()
  ));

CREATE POLICY "Order participants can update orders" ON public.orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.buyers WHERE id = buyer_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.freelancers WHERE id = freelancer_id AND user_id = auth.uid())
  );

-- Withdrawals policies
CREATE POLICY "Freelancers can view their own withdrawals" ON public.withdrawals
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.freelancers WHERE id = freelancer_id AND user_id = auth.uid()
  ));

CREATE POLICY "Freelancers can create withdrawal requests" ON public.withdrawals
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.freelancers WHERE id = freelancer_id AND user_id = auth.uid()
  ));

-- Verification documents policies
CREATE POLICY "Users can view their own verification documents" ON public.verification_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verification documents" ON public.verification_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Support requests policies
CREATE POLICY "Users can view their own support requests" ON public.support_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create support requests" ON public.support_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own support requests" ON public.support_requests
  FOR UPDATE USING (auth.uid() = user_id);

-- Freelancer-Buyer connections policies
CREATE POLICY "Users can view their own connections" ON public.freelancer_buyer_connections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.freelancers WHERE id = freelancer_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.buyers WHERE id = buyer_id AND user_id = auth.uid())
  );

-- Gig reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON public.gig_reviews
  FOR SELECT USING (true);

CREATE POLICY "Buyers can create reviews for their orders" ON public.gig_reviews
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.buyers WHERE id = buyer_id AND user_id = auth.uid()
  ));

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages" ON public.messages
  FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- ============================================
-- INSERT DEFAULT CATEGORIES
-- ============================================

INSERT INTO public.categories (name, slug, description, icon) VALUES
  ('Web Development', 'web-development', 'Website and web application development', 'Code'),
  ('Mobile Development', 'mobile-development', 'iOS and Android app development', 'Smartphone'),
  ('Graphic Design', 'graphic-design', 'Logo, branding, and visual design', 'Palette'),
  ('Content Writing', 'content-writing', 'Blog posts, articles, and copywriting', 'FileText'),
  ('Video Editing', 'video-editing', 'Video production and editing', 'Video'),
  ('Digital Marketing', 'digital-marketing', 'SEO, social media, and online marketing', 'TrendingUp'),
  ('UI/UX Design', 'ui-ux-design', 'User interface and experience design', 'Layout'),
  ('Data Entry', 'data-entry', 'Data processing and entry services', 'Database');
