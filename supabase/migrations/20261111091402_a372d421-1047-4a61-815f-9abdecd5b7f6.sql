CREATE TABLE IF NOT EXISTS public.human_verifications (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  verified_until timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.human_verifications TO authenticated;
GRANT ALL ON public.human_verifications TO service_role;
ALTER TABLE public.human_verifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own human verification" ON public.human_verifications;
CREATE POLICY "Users read own human verification" ON public.human_verifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.require_human_verification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.human_verifications WHERE user_id = auth.uid() AND verified_until > now()) THEN
    RAISE EXCEPTION 'Please complete the "Verify you are human" check and try again.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.require_human_verification() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS human_check_messages ON public.messages;
CREATE TRIGGER human_check_messages BEFORE INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.require_human_verification();
DROP TRIGGER IF EXISTS human_check_gigs ON public.gigs;
CREATE TRIGGER human_check_gigs BEFORE INSERT ON public.gigs FOR EACH ROW EXECUTE FUNCTION public.require_human_verification();
DROP TRIGGER IF EXISTS human_check_jobs ON public.jobs;
CREATE TRIGGER human_check_jobs BEFORE INSERT ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.require_human_verification();
DROP TRIGGER IF EXISTS human_check_job_applications ON public.job_applications;
CREATE TRIGGER human_check_job_applications BEFORE INSERT ON public.job_applications FOR EACH ROW EXECUTE FUNCTION public.require_human_verification();