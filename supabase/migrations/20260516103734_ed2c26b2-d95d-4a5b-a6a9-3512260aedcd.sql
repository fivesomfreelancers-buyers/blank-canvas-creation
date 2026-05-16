
-- Enum for system conversation type
DO $$ BEGIN
  CREATE TYPE public.system_convo_type AS ENUM ('support','news');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.system_sender_type AS ENUM ('user','admin','system');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- system_conversations: one per user per type
CREATE TABLE IF NOT EXISTS public.system_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.system_convo_type NOT NULL,
  last_message text DEFAULT '',
  last_message_at timestamptz DEFAULT now(),
  unread_user int NOT NULL DEFAULT 0,
  unread_admin int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, type)
);

CREATE INDEX IF NOT EXISTS idx_sysconvo_user ON public.system_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_sysconvo_type ON public.system_conversations(type);

-- system_messages
CREATE TABLE IF NOT EXISTS public.system_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.system_conversations(id) ON DELETE CASCADE,
  sender_type public.system_sender_type NOT NULL,
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  body text NOT NULL DEFAULT '',
  attachment_url text,
  is_read_user boolean NOT NULL DEFAULT false,
  is_read_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sysmsg_convo ON public.system_messages(conversation_id, created_at);

ALTER TABLE public.system_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_messages ENABLE ROW LEVEL SECURITY;

-- RLS: system_conversations
DROP POLICY IF EXISTS "user sees own sysconvo" ON public.system_conversations;
CREATE POLICY "user sees own sysconvo" ON public.system_conversations
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "admin manages sysconvo" ON public.system_conversations;
CREATE POLICY "admin manages sysconvo" ON public.system_conversations
  FOR ALL TO authenticated USING (public.is_admin_user(auth.uid())) WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "user updates own sysconvo unread" ON public.system_conversations;
CREATE POLICY "user updates own sysconvo unread" ON public.system_conversations
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- RLS: system_messages
DROP POLICY IF EXISTS "user reads own sysmsg" ON public.system_messages;
CREATE POLICY "user reads own sysmsg" ON public.system_messages
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.system_conversations c WHERE c.id = conversation_id AND (c.user_id = auth.uid() OR public.is_admin_user(auth.uid())))
  );

-- user can insert only into support type messages
DROP POLICY IF EXISTS "user sends support msg" ON public.system_messages;
CREATE POLICY "user sends support msg" ON public.system_messages
  FOR INSERT TO authenticated WITH CHECK (
    sender_type = 'user'
    AND EXISTS (
      SELECT 1 FROM public.system_conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid() AND c.type = 'support'
    )
  );

DROP POLICY IF EXISTS "user updates own sysmsg read" ON public.system_messages;
CREATE POLICY "user updates own sysmsg read" ON public.system_messages
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.system_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.system_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin manages sysmsg" ON public.system_messages;
CREATE POLICY "admin manages sysmsg" ON public.system_messages
  FOR ALL TO authenticated USING (public.is_admin_user(auth.uid())) WITH CHECK (public.is_admin_user(auth.uid()));

-- Trigger function to update conversation summary on new message
CREATE OR REPLACE FUNCTION public.sysmsg_after_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.system_conversations
  SET last_message = LEFT(COALESCE(NEW.body, ''), 200),
      last_message_at = NEW.created_at,
      unread_user = CASE WHEN NEW.sender_type IN ('admin','system') THEN unread_user + 1 ELSE unread_user END,
      unread_admin = CASE WHEN NEW.sender_type = 'user' THEN unread_admin + 1 ELSE unread_admin END
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_sysmsg_after_insert ON public.system_messages;
CREATE TRIGGER trg_sysmsg_after_insert AFTER INSERT ON public.system_messages
FOR EACH ROW EXECUTE FUNCTION public.sysmsg_after_insert();

-- Bootstrap function: create both convos + welcome message for a user
CREATE OR REPLACE FUNCTION public.bootstrap_system_conversations(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _support_id uuid;
  _news_id uuid;
  _role public.app_role;
  _name text;
  _welcome text;
BEGIN
  SELECT role, COALESCE(NULLIF(full_name,''),'saaxiib') INTO _role, _name FROM public.profiles WHERE id = _user_id;

  INSERT INTO public.system_conversations(user_id, type)
  VALUES (_user_id, 'support')
  ON CONFLICT (user_id, type) DO NOTHING
  RETURNING id INTO _support_id;

  INSERT INTO public.system_conversations(user_id, type)
  VALUES (_user_id, 'news')
  ON CONFLICT (user_id, type) DO NOTHING
  RETURNING id INTO _news_id;

  IF _support_id IS NULL THEN
    SELECT id INTO _support_id FROM public.system_conversations WHERE user_id = _user_id AND type = 'support';
  END IF;
  IF _news_id IS NULL THEN
    SELECT id INTO _news_id FROM public.system_conversations WHERE user_id = _user_id AND type = 'news';
  END IF;

  -- Welcome message in support only if empty
  IF NOT EXISTS (SELECT 1 FROM public.system_messages WHERE conversation_id = _support_id) THEN
    IF _role = 'freelancer' THEN
      _welcome := 'Salaan ' || _name || '! 👋' || E'\n\n'
        || 'Ku soo dhawoow Fivesom — suuqa ugu horreeya ee freelancers-ka Soomaalida.' || E'\n\n'
        || 'Si aad si dhaqso ah u bilowdo:' || E'\n'
        || '✅ Dhameystir profile-kaaga' || E'\n'
        || '✅ Ku dar skills-kaaga' || E'\n'
        || '✅ Abuur Gig-kaaga koowaad' || E'\n'
        || '✅ Bilow inaad shaqo hesho' || E'\n\n'
        || 'Hadii aad caawimaad u baahato, halkan nooga soo qor — Fivesom Support 24/7 ayaad heli kartaa.';
    ELSE
      _welcome := 'Salaan ' || _name || '! 👋' || E'\n\n'
        || 'Ku soo dhawoow Fivesom — meesha aad ka heli karto freelancers Soomaaliyeed oo xirfad leh.' || E'\n\n'
        || '🔎 Sahmin freelancers' || E'\n'
        || '🛒 Order samee si sahlan' || E'\n'
        || '💬 Toos ula sheekayso freelancer-ka' || E'\n'
        || '🛡️ Lacagtaadu waxay ku jirtaa escrow ammaan ah' || E'\n\n'
        || 'Hadii aad su''aal qabto, Fivesom Support waa diyaar — halkan noo qor.';
    END IF;

    INSERT INTO public.system_messages(conversation_id, sender_type, body)
    VALUES (_support_id, 'system', _welcome);
  END IF;

  -- News intro if empty
  IF NOT EXISTS (SELECT 1 FROM public.system_messages WHERE conversation_id = _news_id) THEN
    INSERT INTO public.system_messages(conversation_id, sender_type, body)
    VALUES (_news_id, 'system',
      '📣 Ku soo dhawoow Fivesom News!' || E'\n\n' ||
      'Halkan waxaa kaaga imanaya warbixinada cusub, sahaminta freelancers-ka ugu fiican, sifooyinka cusub, iyo ololayaal khaas ah. Fariimo cusub eeg!'
    );
  END IF;
END $$;

-- Trigger on profile insert
CREATE OR REPLACE FUNCTION public.profile_bootstrap_system()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.bootstrap_system_conversations(NEW.id);
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_profile_bootstrap_system ON public.profiles;
CREATE TRIGGER trg_profile_bootstrap_system AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.profile_bootstrap_system();

-- Broadcast helper for admin: insert message into news convos for an audience
CREATE OR REPLACE FUNCTION public.broadcast_news(_body text, _attachment_url text, _audience text)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count int := 0;
BEGIN
  IF NOT public.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can broadcast news';
  END IF;

  INSERT INTO public.system_messages(conversation_id, sender_type, admin_id, body, attachment_url)
  SELECT sc.id, 'admin', auth.uid(), _body, _attachment_url
  FROM public.system_conversations sc
  JOIN public.profiles p ON p.id = sc.user_id
  WHERE sc.type = 'news'
    AND (
      _audience = 'all'
      OR (_audience = 'buyers' AND p.role = 'buyer')
      OR (_audience = 'freelancers' AND p.role = 'freelancer')
    );
  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END $$;

-- Backfill existing users
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id FROM public.profiles LOOP
    PERFORM public.bootstrap_system_conversations(r.id);
  END LOOP;
END $$;

-- Enable realtime
ALTER TABLE public.system_conversations REPLICA IDENTITY FULL;
ALTER TABLE public.system_messages REPLICA IDENTITY FULL;
DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='system_messages';
  IF NOT FOUND THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.system_messages';
  END IF;
END $$;
DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='system_conversations';
  IF NOT FOUND THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.system_conversations';
  END IF;
END $$;
