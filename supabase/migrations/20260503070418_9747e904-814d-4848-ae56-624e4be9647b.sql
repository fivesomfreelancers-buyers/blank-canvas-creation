
-- 1. USER_ROLES
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can self-assign non-admin roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can assign any role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Users can self-assign non-admin roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND role IN ('buyer'::app_role, 'freelancer'::app_role));

CREATE POLICY "Admins can assign any role"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. PROFILES
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
SELECT id, full_name, username, profile_image_url, bio, professional_title,
       skills, languages, location, role, member_since, created_at
FROM public.profiles;
GRANT SELECT ON public.public_profiles TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can view other profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Authenticated can view other profiles"
ON public.profiles FOR SELECT TO authenticated
USING (true);

-- 3. WITHDRAWALS
DROP POLICY IF EXISTS "Freelancers can delete own pending withdrawals" ON public.withdrawals;
CREATE POLICY "Freelancers can delete own pending withdrawals"
ON public.withdrawals FOR DELETE TO authenticated
USING (
  status = 'pending'::withdrawal_status
  AND EXISTS (SELECT 1 FROM public.freelancers f WHERE f.id = withdrawals.freelancer_id AND f.user_id = auth.uid())
);

-- 4. STORAGE: order-requirements
DROP POLICY IF EXISTS "Authenticated users can view requirement files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload requirement files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload requirement files" ON storage.objects;
DROP POLICY IF EXISTS "Order participants can view requirement files" ON storage.objects;
DROP POLICY IF EXISTS "Buyers can upload requirement files" ON storage.objects;

CREATE POLICY "Order participants can view requirement files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'order-requirements'
  AND EXISTS (
    SELECT 1 FROM public.orders o
    LEFT JOIN public.freelancers f ON f.id = o.freelancer_id
    WHERE (o.buyer_id = auth.uid() OR f.user_id = auth.uid())
      AND (storage.foldername(name))[1] = o.id::text
  )
);

CREATE POLICY "Buyers can upload requirement files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'order-requirements'
  AND EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.buyer_id = auth.uid() AND (storage.foldername(name))[1] = o.id::text
  )
);

-- 5. STORAGE: delivery-files
DROP POLICY IF EXISTS "Order participants can view delivery files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view delivery files" ON storage.objects;
DROP POLICY IF EXISTS "Freelancers can upload delivery files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload delivery files" ON storage.objects;
DROP POLICY IF EXISTS "Order participants can read delivery files" ON storage.objects;

CREATE POLICY "Order participants can read delivery files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'delivery-files'
  AND EXISTS (
    SELECT 1 FROM public.orders o
    LEFT JOIN public.freelancers f ON f.id = o.freelancer_id
    WHERE (o.buyer_id = auth.uid() OR f.user_id = auth.uid())
      AND (storage.foldername(name))[1] = o.id::text
  )
);

CREATE POLICY "Freelancers can upload delivery files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'delivery-files'
  AND EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.freelancers f ON f.id = o.freelancer_id
    WHERE f.user_id = auth.uid() AND (storage.foldername(name))[1] = o.id::text
  )
);

-- 6. STORAGE: message-attachments
DROP POLICY IF EXISTS "Users can upload to message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can view message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload own message attachments" ON storage.objects;

CREATE POLICY "Authenticated can view message attachments"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'message-attachments');

CREATE POLICY "Authenticated users can upload own message attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'message-attachments'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 7. REALTIME
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read own realtime channels" ON realtime.messages;
CREATE POLICY "Authenticated can read own realtime channels"
ON realtime.messages FOR SELECT TO authenticated
USING (
  (realtime.topic() = auth.uid()::text)
  OR (realtime.topic() LIKE 'user:' || auth.uid()::text || '%')
  OR (realtime.topic() LIKE 'order:%' AND EXISTS (
        SELECT 1 FROM public.orders o
        LEFT JOIN public.freelancers f ON f.id = o.freelancer_id
        WHERE o.id::text = split_part(realtime.topic(), ':', 2)
          AND (o.buyer_id = auth.uid() OR f.user_id = auth.uid())))
  OR (realtime.topic() LIKE 'conversation:%' AND EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id::text = split_part(realtime.topic(), ':', 2)
          AND (c.buyer_id = auth.uid() OR c.freelancer_id = auth.uid())))
);

DROP POLICY IF EXISTS "Authenticated can broadcast on own channels" ON realtime.messages;
CREATE POLICY "Authenticated can broadcast on own channels"
ON realtime.messages FOR INSERT TO authenticated
WITH CHECK (
  (realtime.topic() = auth.uid()::text)
  OR (realtime.topic() LIKE 'user:' || auth.uid()::text || '%')
  OR (realtime.topic() LIKE 'order:%' AND EXISTS (
        SELECT 1 FROM public.orders o
        LEFT JOIN public.freelancers f ON f.id = o.freelancer_id
        WHERE o.id::text = split_part(realtime.topic(), ':', 2)
          AND (o.buyer_id = auth.uid() OR f.user_id = auth.uid())))
  OR (realtime.topic() LIKE 'conversation:%' AND EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id::text = split_part(realtime.topic(), ':', 2)
          AND (c.buyer_id = auth.uid() OR c.freelancer_id = auth.uid())))
);
