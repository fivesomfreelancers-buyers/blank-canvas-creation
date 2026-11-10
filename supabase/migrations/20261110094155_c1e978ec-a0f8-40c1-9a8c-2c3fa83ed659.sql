DO $$ DECLARE d text; BEGIN
 d := pg_get_functiondef('public.save_buyer_job(jsonb,uuid,boolean)'::regprocedure);
 d := replace(d, 'NOT public.has_role(auth.uid(),''buyer'')', 'public.effective_user_role(auth.uid())::text<>''buyer''');
 d := replace(d, 'A verified buyer account is required', 'Only buyer accounts can post jobs. Freelancers cannot post jobs.');
 EXECUTE d;
END $$;