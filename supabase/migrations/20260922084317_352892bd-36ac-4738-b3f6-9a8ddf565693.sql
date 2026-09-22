-- 1) Move pg_trgm out of the public schema
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- keep trigram-using search functions working
DO $do$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname IN ('search_gigs','search_gig_tags')
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, extensions', r.sig);
  END LOOP;
END
$do$;

-- 2) Lock down SECURITY DEFINER functions in public
DO $do$
DECLARE
  r record;
  anon_ok boolean;
  auth_ok boolean;
  anon_whitelist text[] := ARRAY[
    'is_public_profile','is_listed_freelancer','is_official_attachment',
    'is_admin_user','search_gigs','search_gig_tags','list_founders'
  ];
BEGIN
  FOR r IN
    SELECT p.oid, p.oid::regprocedure AS sig, p.proname,
           (p.prorettype = 'trigger'::regtype) AS is_trigger
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
  LOOP
    anon_ok := has_function_privilege('anon', r.oid, 'EXECUTE');
    auth_ok := has_function_privilege('authenticated', r.oid, 'EXECUTE');

    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', r.sig);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', r.sig);

    IF r.is_trigger THEN
      -- trigger functions execute as the table owner; nobody needs direct EXECUTE
      EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated', r.sig);
    ELSE
      IF auth_ok THEN
        EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', r.sig);
      END IF;
      IF anon_ok AND r.proname = ANY(anon_whitelist) THEN
        EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO anon', r.sig);
      END IF;
    END IF;

    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', r.sig);
  END LOOP;
END
$do$;