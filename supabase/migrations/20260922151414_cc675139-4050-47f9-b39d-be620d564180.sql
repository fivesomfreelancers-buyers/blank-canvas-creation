REVOKE ALL ON FUNCTION public.is_admin_user(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin_user(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Admins can view all accepted deliveries" ON public.accepted_deliveries;
CREATE POLICY "Admins can view all accepted deliveries" ON public.accepted_deliveries FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert action logs" ON public.admin_action_logs;
CREATE POLICY "Admins can insert action logs" ON public.admin_action_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin_user(auth.uid()) AND admin_id = auth.uid());

DROP POLICY IF EXISTS "Admins can read action logs" ON public.admin_action_logs;
CREATE POLICY "Admins can read action logs" ON public.admin_action_logs FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can create announcements" ON public.admin_announcements;
CREATE POLICY "Admins can create announcements" ON public.admin_announcements FOR INSERT TO authenticated WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete announcements" ON public.admin_announcements;
CREATE POLICY "Admins can delete announcements" ON public.admin_announcements FOR DELETE TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can read all buyer_support_tickets" ON public.buyer_support_tickets;
CREATE POLICY "Admins can read all buyer_support_tickets" ON public.buyer_support_tickets FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can update buyer_support_tickets" ON public.buyer_support_tickets;
CREATE POLICY "Admins can update buyer_support_tickets" ON public.buyer_support_tickets FOR UPDATE TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can update disputes" ON public.disputes;
CREATE POLICY "Admins can update disputes" ON public.disputes FOR UPDATE TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can read all freelancer_support_tickets" ON public.freelancer_support_tickets;
CREATE POLICY "Admins can read all freelancer_support_tickets" ON public.freelancer_support_tickets FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can update freelancer_support_tickets" ON public.freelancer_support_tickets;
CREATE POLICY "Admins can update freelancer_support_tickets" ON public.freelancer_support_tickets FOR UPDATE TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can update freelancers" ON public.freelancers;
CREATE POLICY "Admins can update freelancers" ON public.freelancers FOR UPDATE TO authenticated USING (public.is_admin_user(auth.uid())) WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all freelancers" ON public.freelancers;
CREATE POLICY "Admins can view all freelancers" ON public.freelancers FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete reviews" ON public.gig_reviews;
CREATE POLICY "Admins can delete reviews" ON public.gig_reviews FOR DELETE TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete deliveries" ON public.order_deliveries;
CREATE POLICY "Admins can delete deliveries" ON public.order_deliveries FOR DELETE TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can update deliveries" ON public.order_deliveries;
CREATE POLICY "Admins can update deliveries" ON public.order_deliveries FOR UPDATE TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can view deliveries" ON public.order_deliveries;
CREATE POLICY "Admins can view deliveries" ON public.order_deliveries FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete platform settings" ON public.platform_settings;
CREATE POLICY "Admins can delete platform settings" ON public.platform_settings FOR DELETE TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert platform settings" ON public.platform_settings;
CREATE POLICY "Admins can insert platform settings" ON public.platform_settings FOR INSERT TO authenticated WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can read platform settings" ON public.platform_settings;
CREATE POLICY "Admins can read platform settings" ON public.platform_settings FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can update platform settings" ON public.platform_settings;
CREATE POLICY "Admins can update platform settings" ON public.platform_settings FOR UPDATE TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete subcategories" ON public.subcategories;
CREATE POLICY "Admins can delete subcategories" ON public.subcategories FOR DELETE TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert subcategories" ON public.subcategories;
CREATE POLICY "Admins can insert subcategories" ON public.subcategories FOR INSERT TO authenticated WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can update subcategories" ON public.subcategories;
CREATE POLICY "Admins can update subcategories" ON public.subcategories FOR UPDATE TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can read all replies" ON public.support_ticket_replies;
CREATE POLICY "Admins can read all replies" ON public.support_ticket_replies FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can read all support_tickets" ON public.support_tickets;
CREATE POLICY "Admins can read all support_tickets" ON public.support_tickets FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can update support_tickets" ON public.support_tickets;
CREATE POLICY "Admins can update support_tickets" ON public.support_tickets FOR UPDATE TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can assign any role" ON public.user_roles;
CREATE POLICY "Admins can assign any role" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can view verification documents" ON public.verification_documents;
CREATE POLICY "Admins can view verification documents" ON public.verification_documents FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can update wallets" ON public.wallets;
CREATE POLICY "Admins can update wallets" ON public.wallets FOR UPDATE TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all wallets" ON public.wallets;
CREATE POLICY "Admins can view all wallets" ON public.wallets FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can update withdrawals" ON public.withdrawals;
CREATE POLICY "Admins can update withdrawals" ON public.withdrawals FOR UPDATE TO authenticated USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all withdrawals" ON public.withdrawals;
CREATE POLICY "Admins can view all withdrawals" ON public.withdrawals FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

CREATE OR REPLACE FUNCTION public.complete_role_onboarding(
  _role text,
  _full_name text,
  _country text,
  _languages text[] DEFAULT '{}',
  _profile_image_url text DEFAULT NULL,
  _professional_title text DEFAULT NULL,
  _bio text DEFAULT NULL,
  _primary_skill text DEFAULT NULL,
  _industry text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid := auth.uid();
  _target public.app_role;
  _email_verified boolean := false;
  _existing public.app_role;
  _langs text[];
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to finish setup.';
  END IF;

  IF _role NOT IN ('buyer', 'freelancer') THEN
    RAISE EXCEPTION 'Invalid account type.';
  END IF;
  _target := _role::public.app_role;

  SELECT (u.email_confirmed_at IS NOT NULL) INTO _email_verified
  FROM auth.users u WHERE u.id = _user_id;
  IF NOT coalesce(_email_verified, false) THEN
    RAISE EXCEPTION 'Please confirm your email address before finishing setup.';
  END IF;

  SELECT ur.role INTO _existing
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
    AND ur.role IN ('buyer','freelancer','admin','super_admin','founder')
  ORDER BY CASE ur.role
    WHEN 'founder' THEN 1 WHEN 'super_admin' THEN 2 WHEN 'admin' THEN 3
    WHEN 'freelancer' THEN 4 WHEN 'buyer' THEN 5 ELSE 6 END
  LIMIT 1;

  IF coalesce(btrim(_full_name), '') = '' OR char_length(btrim(_full_name)) > 100
     OR coalesce(btrim(_country), '') = '' OR char_length(btrim(_country)) > 120 THEN
    RAISE EXCEPTION 'Enter a valid full name and country.';
  END IF;

  IF _target = 'freelancer' THEN
    IF coalesce(btrim(_professional_title), '') = '' OR char_length(btrim(_professional_title)) > 100 THEN
      RAISE EXCEPTION 'Professional title is required.';
    END IF;
    IF coalesce(btrim(_primary_skill), '') = '' OR char_length(btrim(_primary_skill)) > 100 THEN
      RAISE EXCEPTION 'Choose your primary skill.';
    END IF;
    IF char_length(btrim(coalesce(_bio, ''))) < 50 OR char_length(btrim(coalesce(_bio, ''))) > 500 THEN
      RAISE EXCEPTION 'Professional introduction must be between 50 and 500 characters.';
    END IF;
  ELSE
    IF coalesce(btrim(_industry), '') = '' OR char_length(btrim(_industry)) > 120 THEN
      RAISE EXCEPTION 'Choose your industry or hiring context.';
    END IF;
  END IF;

  SELECT array_agg(DISTINCT btrim(l)) INTO _langs
  FROM unnest(coalesce(_languages, '{}')) AS l
  WHERE btrim(l) <> '' AND char_length(btrim(l)) <= 50;
  IF _langs IS NULL OR array_length(_langs, 1) IS NULL THEN
    RAISE EXCEPTION 'Select at least one language you speak.';
  END IF;

  INSERT INTO public.profiles (id, role, full_name, location, languages)
  VALUES (_user_id, coalesce(_existing, _target), btrim(_full_name), btrim(_country), _langs)
  ON CONFLICT (id) DO NOTHING;

  UPDATE public.profiles p SET
    full_name = btrim(_full_name), location = btrim(_country), languages = _langs,
    professional_title = CASE WHEN _target = 'freelancer' THEN btrim(_professional_title) ELSE p.professional_title END,
    bio = CASE WHEN _target = 'freelancer' THEN btrim(_bio) ELSE p.bio END,
    skills = CASE WHEN _target = 'freelancer' THEN ARRAY[btrim(_primary_skill)] ELSE p.skills END,
    industry = CASE WHEN _target = 'buyer' THEN btrim(_industry) ELSE p.industry END,
    profile_image_url = coalesce(nullif(btrim(coalesce(_profile_image_url, '')), ''), p.profile_image_url),
    updated_at = now()
  WHERE p.id = _user_id;

  IF _existing IS NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _target)
    ON CONFLICT (user_id, role) DO NOTHING;
    DELETE FROM public.user_roles WHERE user_id = _user_id AND role = 'user'::public.app_role;
  END IF;

  IF coalesce(_existing, _target) = 'freelancer'::public.app_role THEN
    INSERT INTO public.freelancers (user_id, bio, skills)
    VALUES (_user_id, btrim(coalesce(_bio, '')), ARRAY[btrim(coalesce(_primary_skill, ''))])
    ON CONFLICT (user_id) DO UPDATE SET
      bio = coalesce(nullif(EXCLUDED.bio, ''), public.freelancers.bio),
      skills = CASE WHEN coalesce(EXCLUDED.skills[1], '') <> '' THEN EXCLUDED.skills ELSE public.freelancers.skills END;
  ELSIF coalesce(_existing, _target) = 'buyer'::public.app_role THEN
    INSERT INTO public.buyers (user_id, industry)
    VALUES (_user_id, nullif(btrim(coalesce(_industry, '')), ''))
    ON CONFLICT (user_id) DO UPDATE SET
      industry = coalesce(nullif(EXCLUDED.industry, ''), public.buyers.industry);
  END IF;

  PERFORM public.sync_profile_role(_user_id);
  RETURN public.get_account_state();
END;
$function$;

REVOKE ALL ON FUNCTION public.complete_role_onboarding(text, text, text, text[], text, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_role_onboarding(text, text, text, text[], text, text, text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.complete_role_onboarding(text, text, text, text[], text, text, text, text, text) TO authenticated, service_role;