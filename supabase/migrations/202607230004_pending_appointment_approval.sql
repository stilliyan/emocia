create or replace function public.set_public_appointment_pending()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    new.status := 'pending';
  end if;
  return new;
end;
$$;

revoke all on function public.set_public_appointment_pending() from public;

drop trigger if exists appointment_00_public_pending_insert on public.appointments;
create trigger appointment_00_public_pending_insert
before insert on public.appointments
for each row execute function public.set_public_appointment_pending();

create or replace function public.sync_appointment_calendar_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_id uuid;
  calendar_status text;
  event_description text;
begin
  if new.status = 'pending' then
    if new.calendar_event_id is not null then
      delete from public.calendar_events where id = new.calendar_event_id;
      new.calendar_event_id := null;
    end if;
    return new;
  end if;

  if new.status = 'cancelled' and new.calendar_event_id is null then
    return new;
  end if;

  select p.id into admin_id
  from public.profiles p
  where p.role = 'admin'
  order by p.created_at
  limit 1;

  if admin_id is null then
    raise exception 'appointment_calendar_admin_missing';
  end if;

  calendar_status := case new.status
    when 'cancelled' then 'cancelled'
    when 'completed' then 'completed'
    else 'upcoming'
  end;

  event_description := concat_ws(E'\n',
    'Телефон: ' || new.phone,
    case when new.email is not null then 'Имейл: ' || new.email end,
    'Тип: ' || case new.appointment_type
      when 'bridal' then 'Булчинска рокля'
      when 'formal' then 'Официална рокля'
      when 'accessories' then 'Аксесоари'
      else 'Друго'
    end,
    'Придружители: ' || new.companions,
    case when new.product_name is not null then 'Модел: ' || new.product_name end,
    new.comment
  );

  if new.calendar_event_id is not null then
    update public.calendar_events
    set
      title = 'Проба — ' || new.customer_name,
      description = event_description,
      start_at = new.start_at,
      end_at = new.end_at,
      all_day = false,
      color = '#111111',
      status = calendar_status
    where id = new.calendar_event_id;
  end if;

  if new.calendar_event_id is null or not found then
    insert into public.calendar_events (
      title,
      description,
      start_at,
      end_at,
      all_day,
      color,
      status,
      created_by
    ) values (
      'Проба — ' || new.customer_name,
      event_description,
      new.start_at,
      new.end_at,
      false,
      '#111111',
      calendar_status,
      coalesce(new.created_by, admin_id)
    )
    returning id into new.calendar_event_id;
  end if;

  return new;
end;
$$;

revoke all on function public.sync_appointment_calendar_event() from public;
