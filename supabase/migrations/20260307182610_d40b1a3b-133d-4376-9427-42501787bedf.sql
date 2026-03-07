-- Add languages to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}'::text[];

-- Add last_seen for online status
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen timestamp with time zone DEFAULT now();

-- Add tags and buyer_requirements to gigs table
ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];
ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS buyer_requirements text DEFAULT '';
