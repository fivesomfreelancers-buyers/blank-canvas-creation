-- Upserting an object (replacing an existing avatar/image) requires SELECT on
-- storage.objects for the caller. The public media buckets had no SELECT policy,
-- so every "replace my photo" upload failed with:
--   new row violates row-level security policy
-- Grant owner-scoped SELECT (folder = auth.uid()) so listing other users'
-- folders stays impossible, while public URL reads are unaffected (public bucket).

DROP POLICY IF EXISTS "Owners can read own profile images" ON storage.objects;
CREATE POLICY "Owners can read own profile images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Owners can read own gig images" ON storage.objects;
CREATE POLICY "Owners can read own gig images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'gig-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Owners can read own gig media" ON storage.objects;
CREATE POLICY "Owners can read own gig media"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'gig-media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Owners can read own gig thumbnails" ON storage.objects;
CREATE POLICY "Owners can read own gig thumbnails"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'gig-thumbnails' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Owners can read own verification portfolio" ON storage.objects;
CREATE POLICY "Owners can read own verification portfolio"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'verification-portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Make the UPDATE (replace) policies explicit about the new row as well.
DROP POLICY IF EXISTS "Users can update own profile image" ON storage.objects;
CREATE POLICY "Users can update own profile image"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update profile images" ON storage.objects;
