-- Remove broad public/listing policies on sensitive buckets
DROP POLICY IF EXISTS "Public read delivery-files" ON storage.objects;
DROP POLICY IF EXISTS "Public read order-requirements" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can view message attachments" ON storage.objects;

-- Order participants can read order-requirements
DROP POLICY IF EXISTS "Order participants can read order-requirements" ON storage.objects;
CREATE POLICY "Order participants can read order-requirements"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'order-requirements'
  AND EXISTS (
    SELECT 1 FROM public.orders o
    LEFT JOIN public.freelancers f ON f.id = o.freelancer_id
    WHERE (storage.foldername(objects.name))[1] = (o.id)::text
      AND (o.buyer_id = auth.uid() OR f.user_id = auth.uid())
  )
);

-- Order participants can read delivery-files
DROP POLICY IF EXISTS "Order participants can read delivery-files only" ON storage.objects;
CREATE POLICY "Order participants can read delivery-files only"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'delivery-files'
  AND EXISTS (
    SELECT 1 FROM public.orders o
    LEFT JOIN public.freelancers f ON f.id = o.freelancer_id
    WHERE (storage.foldername(objects.name))[1] = (o.id)::text
      AND (o.buyer_id = auth.uid() OR f.user_id = auth.uid())
  )
);

-- Conversation participants only can read message attachments
DROP POLICY IF EXISTS "Conversation participants can view message attachments" ON storage.objects;
CREATE POLICY "Conversation participants can view message attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'message-attachments'
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE (c.id)::text = (storage.foldername(objects.name))[1]
        AND (c.buyer_id = auth.uid() OR c.freelancer_id = auth.uid())
    )
  )
);