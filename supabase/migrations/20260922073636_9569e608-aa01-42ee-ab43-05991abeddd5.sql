create or replace function public.is_email_verified(_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from auth.users u
    where u.id = _user_id and u.email_confirmed_at is not null
  )
$$;

grant execute on function public.is_email_verified(uuid) to authenticated, service_role;

drop policy if exists "Users can self-assign non-admin roles" on public.user_roles;
create policy "Users can self-assign non-admin roles"
on public.user_roles for insert to authenticated
with check (
  auth.uid() = user_id
  and (
    role = 'user'::app_role
    or (role = any (array['buyer'::app_role, 'freelancer'::app_role]) and public.is_email_verified(auth.uid()))
  )
);

drop policy if exists "Users can insert own buyer" on public.buyers;
create policy "Users can insert own buyer"
on public.buyers for insert to authenticated
with check (auth.uid() = user_id and public.is_email_verified(auth.uid()));

drop policy if exists "Users can insert own freelancer" on public.freelancers;
create policy "Users can insert own freelancer"
on public.freelancers for insert to authenticated
with check (auth.uid() = user_id and public.is_email_verified(auth.uid()));

drop policy if exists "Freelancers can insert own gigs" on public.gigs;
create policy "Freelancers can insert own gigs"
on public.gigs for insert to authenticated
with check (
  exists (
    select 1 from public.freelancers f
    where f.id = gigs.freelancer_id and f.user_id = auth.uid()
  )
  and public.is_email_verified(auth.uid())
);

drop policy if exists "Buyers can create orders" on public.orders;
create policy "Buyers can create orders"
on public.orders for insert to authenticated
with check (auth.uid() = buyer_id and public.is_email_verified(auth.uid()));