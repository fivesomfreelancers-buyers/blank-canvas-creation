
DO $$ BEGIN
  CREATE TYPE public.dispute_sender_role AS ENUM ('buyer','freelancer','admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.dispute_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dispute_id uuid NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_role public.dispute_sender_role NOT NULL,
  body text NOT NULL DEFAULT '',
  attachment_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dispute_messages_dispute_id_created_idx
  ON public.dispute_messages(dispute_id, created_at);

ALTER TABLE public.dispute_messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_dispute_participant(_dispute_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.disputes d
    LEFT JOIN public.freelancers f ON f.id = d.freelancer_id
    WHERE d.id = _dispute_id
      AND (d.buyer_id = _user_id OR f.user_id = _user_id)
  ) OR public.is_admin_user(_user_id)
$$;

DROP POLICY IF EXISTS "Participants can read dispute messages" ON public.dispute_messages;
CREATE POLICY "Participants can read dispute messages"
ON public.dispute_messages FOR SELECT TO authenticated
USING (public.is_dispute_participant(dispute_id, auth.uid()));

DROP POLICY IF EXISTS "Participants can send dispute messages" ON public.dispute_messages;
CREATE POLICY "Participants can send dispute messages"
ON public.dispute_messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND public.is_dispute_participant(dispute_id, auth.uid())
  AND (
    (sender_role = 'admin' AND public.is_admin_user(auth.uid()))
    OR (sender_role = 'buyer' AND EXISTS (SELECT 1 FROM public.disputes d WHERE d.id = dispute_id AND d.buyer_id = auth.uid()))
    OR (sender_role = 'freelancer' AND EXISTS (SELECT 1 FROM public.disputes d JOIN public.freelancers f ON f.id = d.freelancer_id WHERE d.id = dispute_id AND f.user_id = auth.uid()))
  )
);

ALTER TABLE public.dispute_messages REPLICA IDENTITY FULL;
ALTER TABLE public.disputes REPLICA IDENTITY FULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='dispute_messages') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.dispute_messages';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='disputes') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.disputes';
  END IF;
END $$;
