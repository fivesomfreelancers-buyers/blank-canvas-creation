create or replace function public.notify_system_message_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.sender_type = 'user' then
    return NEW;
  end if;
  begin
    perform net.http_post(
      url := 'https://afjcjjelgppctsnmtbek.supabase.co/functions/v1/send-system-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-hook-secret', '4b91dcda559aa3545195603b0446bc5b7bf2aab61af632ff'
      ),
      body := jsonb_build_object('message_id', NEW.id)
    );
  exception when others then
    raise warning 'notify_system_message_email failed: %', sqlerrm;
  end;
  return NEW;
end;
$$;

drop trigger if exists system_messages_notify_email on public.system_messages;
create trigger system_messages_notify_email
after insert on public.system_messages
for each row execute function public.notify_system_message_email();