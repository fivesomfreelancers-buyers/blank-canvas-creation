UPDATE storage.buckets SET public = true WHERE id = 'message-attachments';
-- Ensure users can upload to message-attachments if policy doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND policyname = 'Users can upload to message attachments'
    ) THEN
        CREATE POLICY "Users can upload to message attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'message-attachments');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND policyname = 'Anyone can view message attachments'
    ) THEN
        CREATE POLICY "Anyone can view message attachments" ON storage.objects FOR SELECT USING (bucket_id = 'message-attachments');
    END IF;
END $$;