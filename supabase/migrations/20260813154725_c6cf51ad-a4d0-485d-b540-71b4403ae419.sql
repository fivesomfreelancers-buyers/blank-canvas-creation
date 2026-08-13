create or replace function public.notify_order_email()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $$
begin
  if NEW.payment_status = 'paid' and (TG_OP = 'INSERT' or OLD.payment_status is distinct from 'paid') then
    begin
      perform net.http_post(
        url := 'https://afjcjjelgppctsnmtbek.supabase.co/functions/v1/send-order-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-hook-secret', '4b91dcda559aa3545195603b0446bc5b7bf2aab61af632ff'
        ),
        body := jsonb_build_object('kind', 'new_order', 'order_id', NEW.id)
      );
    exception when others then
      raise warning 'notify_order_email failed: %', sqlerrm;
    end;
  end if;
  return NEW;
end;
$$;

drop trigger if exists orders_notify_order_email on public.orders;
create trigger orders_notify_order_email
after insert or update of payment_status on public.orders
for each row execute function public.notify_order_email();

create or replace function public.notify_delivery_email()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $$
begin
  begin
    perform net.http_post(
      url := 'https://afjcjjelgppctsnmtbek.supabase.co/functions/v1/send-order-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-hook-secret', '4b91dcda559aa3545195603b0446bc5b7bf2aab61af632ff'
      ),
      body := jsonb_build_object('kind', 'delivery', 'delivery_id', NEW.id)
    );
  exception when others then
    raise warning 'notify_delivery_email failed: %', sqlerrm;
  end;
  return NEW;
end;
$$;

drop trigger if exists order_deliveries_notify_email on public.order_deliveries;
create trigger order_deliveries_notify_email
after insert on public.order_deliveries
for each row execute function public.notify_delivery_email();