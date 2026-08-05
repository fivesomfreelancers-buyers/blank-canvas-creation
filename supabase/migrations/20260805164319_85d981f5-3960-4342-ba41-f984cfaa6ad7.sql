REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.enforce_insert_rate_limit() FROM anon, authenticated;