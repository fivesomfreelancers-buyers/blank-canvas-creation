-- Make order-requirements and delivery-files buckets public so attached files render via public URLs
UPDATE storage.buckets SET public = true WHERE id IN ('order-requirements', 'delivery-files');

-- Ensure public read policies exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public read order-requirements') THEN
    CREATE POLICY "Public read order-requirements" ON storage.objects FOR SELECT USING (bucket_id = 'order-requirements');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public read delivery-files') THEN
    CREATE POLICY "Public read delivery-files" ON storage.objects FOR SELECT USING (bucket_id = 'delivery-files');
  END IF;
END $$;