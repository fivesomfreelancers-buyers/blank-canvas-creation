
-- 1) Restrict freelancer financial data from anonymous visitors
REVOKE SELECT (total_earnings) ON public.freelancers FROM anon;

-- 2) Make sensitive buckets private
UPDATE storage.buckets SET public = false WHERE id IN ('order-requirements','delivery-files','message-attachments');

-- 3) Drop any legacy broad public/auth read policies on these buckets (idempotent)
DROP POLICY IF EXISTS "Public read order-requirements" ON storage.objects;
DROP POLICY IF EXISTS "Public read delivery-files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can view message attachments" ON storage.objects;
