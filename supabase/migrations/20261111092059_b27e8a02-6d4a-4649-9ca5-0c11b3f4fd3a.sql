REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer, text) TO service_role;

CREATE OR REPLACE FUNCTION public.bootstrap_system_conversations(_user_id uuid)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  _support_id uuid; _news_id uuid; _role public.app_role; _name text; _welcome text;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> _user_id AND NOT public.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  SELECT role, COALESCE(NULLIF(full_name,''),'saaxiib') INTO _role, _name FROM public.profiles WHERE id = _user_id;

  INSERT INTO public.system_conversations(user_id, type) VALUES (_user_id, 'support')
  ON CONFLICT (user_id, type) DO NOTHING RETURNING id INTO _support_id;
  INSERT INTO public.system_conversations(user_id, type) VALUES (_user_id, 'news')
  ON CONFLICT (user_id, type) DO NOTHING RETURNING id INTO _news_id;

  IF _support_id IS NULL THEN
    SELECT id INTO _support_id FROM public.system_conversations WHERE user_id = _user_id AND type = 'support';
  END IF;
  IF _news_id IS NULL THEN
    SELECT id INTO _news_id FROM public.system_conversations WHERE user_id = _user_id AND type = 'news';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.system_messages WHERE conversation_id = _support_id) THEN
    IF _role = 'freelancer' THEN
      _welcome := 'Hi ' || _name || '! 👋' || E'\n\n'
        || 'Welcome to Fivesom — the marketplace built for Somali freelancers.' || E'\n\n'
        || 'To get started quickly:' || E'\n'
        || '✅ Complete your profile' || E'\n'
        || '✅ Add your skills' || E'\n'
        || '✅ Create your first Gig' || E'\n'
        || '✅ Start receiving orders' || E'\n\n'
        || 'Need help? Just write here — Fivesom Support is available 24/7.';
    ELSE
      _welcome := 'Hi ' || _name || '! 👋' || E'\n\n'
        || 'Welcome to Fivesom — where you find skilled Somali freelancers.' || E'\n\n'
        || '🔎 Explore freelancers' || E'\n'
        || '🛒 Order in a few clicks' || E'\n'
        || '💬 Chat directly with your seller' || E'\n'
        || '🛡️ Your payment is protected by secure escrow' || E'\n\n'
        || 'Any questions? Fivesom Support is here — just write to us.';
    END IF;
    INSERT INTO public.system_messages(conversation_id, sender_type, body) VALUES (_support_id, 'system', _welcome);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.system_messages WHERE conversation_id = _news_id) THEN
    INSERT INTO public.system_messages(conversation_id, sender_type, body)
    VALUES (_news_id, 'system',
      '📣 Welcome to Fivesom News!' || E'\n\n' ||
      'This is where you receive platform updates, new features, top freelancer spotlights and special campaigns. Watch for new messages!');
  END IF;

  INSERT INTO public.system_messages(conversation_id, sender_type, admin_id, body, attachment_url, broadcast_id, is_read_user)
  SELECT _news_id, 'admin', b.created_by, b.body, b.attachment_url, b.id, true
  FROM public.news_broadcasts b
  WHERE public.news_audience_matches(b.audience, _user_id)
    AND NOT EXISTS (SELECT 1 FROM public.system_messages m WHERE m.conversation_id = _news_id AND m.broadcast_id = b.id);
END $function$;