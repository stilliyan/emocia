create table if not exists public.appointment_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  phone text not null check (char_length(phone) between 7 and 30),
  preferred_date date not null,
  preferred_time time not null,
  message text,
  product_name text,
  product_id text,
  source text not null default 'other',
  current_url text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  calendar_event_id uuid references public.calendar_events(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.appointment_requests add column if not exists product_id text;
alter table public.appointment_requests add column if not exists source text not null default 'other';
alter table public.appointment_requests add column if not exists current_url text;

create index if not exists appointment_requests_status_date_idx
on public.appointment_requests(status, preferred_date, preferred_time);

create index if not exists appointment_requests_phone_created_idx
on public.appointment_requests(phone, created_at desc);

drop trigger if exists appointment_requests_touch on public.appointment_requests;
create trigger appointment_requests_touch
before update on public.appointment_requests
for each row execute function public.touch_updated_at();

alter table public.appointment_requests enable row level security;

drop policy if exists "admin appointment requests select" on public.appointment_requests;
create policy "admin appointment requests select"
on public.appointment_requests for select to authenticated
using (public.is_admin());

drop policy if exists "admin appointment requests update" on public.appointment_requests;
create policy "admin appointment requests update"
on public.appointment_requests for update to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin appointment requests delete" on public.appointment_requests;
create policy "admin appointment requests delete"
on public.appointment_requests for delete to authenticated
using (public.is_admin());

revoke all on public.appointment_requests from anon;
grant select, update, delete on public.appointment_requests to authenticated;

drop function if exists public.submit_appointment_request(text, text, date, time, text, text);

create or replace function public.submit_appointment_request(
  p_name text,
  p_phone text,
  p_preferred_date date,
  p_preferred_time time,
  p_message text default null,
  p_product_name text default null,
  p_product_id text default null,
  p_source text default 'other',
  p_current_url text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  request_id uuid;
  normalized_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g');
begin
  if char_length(trim(coalesce(p_name, ''))) not between 2 and 120 then
    raise exception 'invalid_name';
  end if;
  if char_length(normalized_phone) not between 7 and 30 then
    raise exception 'invalid_phone';
  end if;
  if p_preferred_date < current_date or p_preferred_date > current_date + 180 then
    raise exception 'invalid_date';
  end if;
  if p_preferred_time < time '10:00' or p_preferred_time > time '18:00' then
    raise exception 'invalid_time';
  end if;
  if char_length(coalesce(p_message, '')) > 1000
    or char_length(coalesce(p_product_name, '')) > 160
    or char_length(coalesce(p_product_id, '')) > 160
    or char_length(coalesce(p_current_url, '')) > 500 then
    raise exception 'invalid_content';
  end if;
  if coalesce(p_source, 'other') not in ('home', 'contact', 'product', 'blog', 'gallery', 'collection', 'accessories', 'about', 'other') then
    raise exception 'invalid_source';
  end if;
  if coalesce(p_current_url, '') <> '' and (left(p_current_url, 1) <> '/' or left(p_current_url, 2) = '//') then
    raise exception 'invalid_url';
  end if;
  if (
    select count(*)
    from public.appointment_requests
    where regexp_replace(phone, '[^0-9+]', '', 'g') = normalized_phone
      and created_at > now() - interval '30 minutes'
  ) >= 3 then
    raise exception 'rate_limit';
  end if;

  insert into public.appointment_requests (
    name, phone, preferred_date, preferred_time, message, product_name,
    product_id, source, current_url
  ) values (
    trim(p_name), trim(p_phone), p_preferred_date, p_preferred_time,
    nullif(trim(coalesce(p_message, '')), ''),
    nullif(trim(coalesce(p_product_name, '')), ''),
    nullif(trim(coalesce(p_product_id, '')), ''),
    coalesce(nullif(trim(coalesce(p_source, '')), ''), 'other'),
    nullif(trim(coalesce(p_current_url, '')), '')
  ) returning id into request_id;

  return request_id;
end;
$$;

revoke all on function public.submit_appointment_request(text, text, date, time, text, text, text, text, text) from public;
grant execute on function public.submit_appointment_request(text, text, date, time, text, text, text, text, text) to anon, authenticated;

create or replace function public.confirm_appointment_request(p_request_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  request_row public.appointment_requests%rowtype;
  starts_at timestamptz;
  ends_at timestamptz;
  event_id uuid;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  select * into request_row
  from public.appointment_requests
  where id = p_request_id
  for update;

  if not found or request_row.status <> 'pending' then
    raise exception 'invalid_request';
  end if;

  starts_at := (request_row.preferred_date + request_row.preferred_time) at time zone 'Europe/Sofia';
  ends_at := starts_at + interval '1 hour';

  if exists (
    select 1 from public.calendar_events
    where status = 'upcoming'
      and start_at < ends_at
      and coalesce(end_at, start_at + interval '1 hour') > starts_at
  ) then
    raise exception 'slot_conflict';
  end if;

  insert into public.calendar_events (
    title, description, start_at, end_at, all_day, color, status, created_by
  ) values (
    'Проба — ' || request_row.name,
    concat_ws(E'\n',
      'Телефон: ' || request_row.phone,
      case when request_row.product_name is not null then 'Модел: ' || request_row.product_name end,
      request_row.message
    ),
    starts_at, ends_at, false, '#111111', 'upcoming', auth.uid()
  ) returning id into event_id;

  update public.appointment_requests
  set status = 'confirmed', calendar_event_id = event_id
  where id = request_row.id;

  return event_id;
end;
$$;

revoke all on function public.confirm_appointment_request(uuid) from public;
grant execute on function public.confirm_appointment_request(uuid) to authenticated;
