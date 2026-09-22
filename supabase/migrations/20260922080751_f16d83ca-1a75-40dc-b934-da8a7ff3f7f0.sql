create or replace function public.user_roles_require_verified_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Admin/founder actions and server-side (service role) operations are exempt.
  if auth.uid() is null or public.is_admin_user() or public.is_founder_user() then
    return new;
  end if;

  if new.role in ('buyer','freelancer') and not public.is_email_verified(new.user_id) then
    raise exception 'Email address must be confirmed before becoming a % on Fivesom', new.role
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists user_roles_require_verified_email on public.user_roles;
create trigger user_roles_require_verified_email
before insert or update on public.user_roles
for each row execute function public.user_roles_require_verified_email();