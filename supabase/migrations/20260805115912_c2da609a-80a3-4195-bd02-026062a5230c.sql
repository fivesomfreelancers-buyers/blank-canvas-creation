DROP TRIGGER IF EXISTS trg_moderate_messages ON public.messages;
DROP TRIGGER IF EXISTS trg_moderate_system_messages ON public.system_messages;
DROP TRIGGER IF EXISTS trg_moderate_dispute_messages ON public.dispute_messages;
DROP FUNCTION IF EXISTS public.moderate_message_content() CASCADE;
DROP FUNCTION IF EXISTS public.content_is_disallowed(text) CASCADE;