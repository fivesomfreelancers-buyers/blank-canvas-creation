CREATE OR REPLACE VIEW public.public_profiles AS
SELECT id, full_name, username, profile_image_url, bio, professional_title,
       skills, languages, location, role, member_since, created_at, last_seen
FROM public.profiles;