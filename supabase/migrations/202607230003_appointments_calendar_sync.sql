alter table public.appointments
  add column if not exists calendar_event_id uuid references public.calendar_events(id) on delete set null;

create unique index if not exists appointments_calendar_event_id_unique_idx
on public.appointments(calendar_event_id)
where calendar_event_id is not null;

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

drop trigger if exists appointment_calendar_sync_insert on public.appointments;
create trigger appointment_calendar_sync_insert
before insert on public.appointments
for each row execute function public.sync_appointment_calendar_event();

drop trigger if exists appointment_calendar_sync_update on public.appointments;
create trigger appointment_calendar_sync_update
before update of start_at, end_at, customer_name, phone, email, appointment_type,
  companions, comment, product_name, status, created_by
on public.appointments
for each row execute function public.sync_appointment_calendar_event();

update public.appointments
set status = status
where calendar_event_id is null;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'appointments'
  ) then
    alter publication supabase_realtime add table public.appointments;
  end if;
end;
$$;
