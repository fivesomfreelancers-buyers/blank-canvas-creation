DO $$ DECLARE src text; BEGIN
  SELECT pg_get_functiondef('public.detect_offplatform_contact(text)'::regprocedure) INTO src;
  src := replace(src, $q$verb := n ~ '(contact|reach|message|msg|text me|dm|call|chat with|add me|write to|send (me|your|a)|screenshot|hiring manager|xiriir|lasoo|la soo|iigu|ii soo|contatta|scrivi|chiama|manda)';$q$,
    $q$verb := n ~ '\m(contact|reach|message|msg|text me|dm|call|chat with|add me|write to|send (me|your|a)|screenshot|hiring manager|xiriir|lasoo|la soo|iigu|ii soo|contattami|contatta|scrivimi|scrivi|chiamami|mandami)\M';$q$);
  src := replace(src, $q$app_kw := c ~ '(telegram|telegarm|telgram|whatsapp|whatsap|watsapp|watsap|whatapp|signal|viber|wechat|skype|imo)';$q$,
    $q$app_kw := c ~ '(telegram|telegarm|telgram|whatsapp|whatsap|watsapp|watsap|whatapp|viber|wechat|skype)';$q$);
  src := replace(src, $q$IF EXISTS (SELECT 1 FROM jsonb_array_elements(f) e WHERE e->>'type' IN ('telegram','whatsapp','email','phone','offplatform'))$q$,
    $q$IF EXISTS (SELECT 1 FROM jsonb_array_elements(f) e WHERE e->>'type' IN ('whatsapp','email','phone','offplatform') OR (e->>'type'='telegram' AND e->>'match' ~ 't\.me|telegram\.'))$q$);
  EXECUTE src;
END $$;