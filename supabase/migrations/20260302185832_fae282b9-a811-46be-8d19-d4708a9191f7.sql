
-- Drop and recreate storage policies to ensure they're correct
DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view gig images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload gig images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own gig images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own gig images" ON storage.objects;

-- Profile images
CREATE POLICY "Anyone can view profile images" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');
CREATE POLICY "Users can upload own profile image" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own profile image" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own profile image" ON storage.objects FOR DELETE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Gig images
CREATE POLICY "Anyone can view gig images" ON storage.objects FOR SELECT USING (bucket_id = 'gig-images');
CREATE POLICY "Authenticated users can upload gig images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gig-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own gig images" ON storage.objects FOR UPDATE USING (bucket_id = 'gig-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own gig images" ON storage.objects FOR DELETE USING (bucket_id = 'gig-images' AND auth.uid()::text = (storage.foldername(name))[1]);
