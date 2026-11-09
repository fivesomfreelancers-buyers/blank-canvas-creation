GRANT SELECT ON public.jobs TO anon, authenticated;
GRANT ALL ON public.jobs TO service_role;
GRANT SELECT ON public.job_applications, public.job_agreements, public.job_review_history TO authenticated;
GRANT ALL ON public.job_applications, public.job_agreements, public.job_review_history TO service_role;
GRANT SELECT, INSERT, DELETE ON public.buyer_follows TO authenticated;
GRANT ALL ON public.buyer_follows TO service_role;
GRANT EXECUTE ON FUNCTION public.save_buyer_job(jsonb,uuid,boolean), public.review_buyer_job(uuid,text,text), public.set_buyer_job_status(uuid,text), public.build_freelancer_cv(), public.submit_job_application(uuid,text,numeric,integer,jsonb,text), public.review_job_application(uuid,text), public.accept_job_agreement(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_job_buyer(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_job_payment(uuid,uuid,numeric,text,text) TO service_role;