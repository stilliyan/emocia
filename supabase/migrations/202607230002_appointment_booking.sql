create extension if not exists btree_gist;

create table if not exists public.appointment_settings (
  id boolean primary key default true check (id),
  timezone text not null default 'Europe/Sofia' check (timezone = 'Europe/Sofia'),
  duration_minutes integer not null default 60 check (duration_minutes between 15 and 240),
  buffer_minutes integer not null default 15 check (buffer_minutes between 0 and 120),
  maximum_companions integer not null default 3 check (maximum_companions between 0 and 10),
  booking_window_days integer not null default 120 check (booking_window_days between 1 and 365),
  minimum_notice_hours integer not null default 24 check (minimum_notice_hours between 0 and 720),
  weekly_schedule jsonb not null default
    '{"1":[["10:00","19:00"]],"2":[["10:00","19:00"]],"3":[["10:00","19:00"]],"4":[["10:00","19:00"]],"5":[["10:00","19:00"]],"6":[["10:00","19:00"]],"7":[]}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint appointment_schedule_is_object check (jsonb_typeof(weekly_schedule) = 'object')
);

insert into public.appointment_settings (id) values (true)
on conflict (id) do nothing;

create table if not exists public.appointment_blocks (
  id uuid primary key default gen_random_uuid(),
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointment_blocks_valid_range check (end_at > start_at)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  start_at timestamptz not null,
  end_at timestamptz not null,
  occupied_until timestamptz not null,
  timezone text not null default 'Europe/Sofia' check (timezone = 'Europe/Sofia'),
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  phone text not null check (char_length(phone) between 7 and 30),
  normalized_phone text not null check (char_length(normalized_phone) between 7 and 30),
  email text,
  appointment_type text not null check (appointment_type in ('bridal', 'formal', 'accessories', 'other')),
  companions integer not null default 0 check (companions between 0 and 10),
  comment text,
  product_id text,
  product_name text,
  source text not null default 'other',
  current_url text,
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  privacy_consent_at timestamptz not null,
  idempotency_key uuid not null unique,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_valid_range check (end_at > start_at and occupied_until >= end_at),
  constraint appointments_email_length check (email is null or char_length(email) <= 254),
  constraint appointments_comment_length check (comment is null or char_length(comment) <= 1000)
  ,constraint appointments_source_valid check (source in ('home', 'contact', 'product', 'blog', 'gallery', 'collection', 'accessories', 'about', 'other'))
  ,constraint appointments_context_length check (
    char_length(coalesce(product_id, '')) <= 160
    and char_length(coalesce(product_name, '')) <= 160
    and char_length(coalesce(current_url, '')) <= 500
  )
);

alter table public.appointments
  drop constraint if exists appointments_no_active_overlap;
alter table public.appointments
  add constraint appointments_no_active_overlap
  exclude using gist (
    tstzrange(start_at, occupied_until, '[)') with &&
  ) where (status in ('pending', 'confirmed'));

create index if not exists appointments_start_at_idx on public.appointments(start_at);
create index if not exists appointments_status_start_idx on public.appointments(status, start_at);
create index if not exists appointments_phone_created_idx on public.appointments(normalized_phone, created_at desc);
create index if not exists appointment_blocks_range_idx on public.appointment_blocks using gist (tstzrange(start_at, end_at, '[)'));

drop trigger if exists appointment_settings_touch on public.appointment_settings;
create trigger appointment_settings_touch before update on public.appointment_settings
for each row execute function public.touch_updated_at();
drop trigger if exists appointment_blocks_touch on public.appointment_blocks;
create trigger appointment_blocks_touch before update on public.appointment_blocks
for each row execute function public.touch_updated_at();
drop trigger if exists appointments_touch on public.appointments;
create trigger appointments_touch before update on public.appointments
for each row execute function public.touch_updated_at();

alter table public.appointment_settings enable row level security;
alter table public.appointment_blocks enable row level security;
alter table public.appointments enable row level security;

create policy "admin appointment settings" on public.appointment_settings
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin appointment blocks" on public.appointment_blocks
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin appointments" on public.appointments
for all to authenticated using (public.is_admin()) with check (public.is_admin());

revoke all on public.appointment_settings from anon;
revoke all on public.appointment_blocks from anon;
revoke all on public.appointments from anon;
grant select, insert, update, delete on public.appointment_settings to authenticated;
grant select, insert, update, delete on public.appointment_blocks to authenticated;
grant select, insert, update, delete on public.appointments to authenticated;

create or replace function public.appointment_slots_for_date(p_date date)
returns table (slot_start timestamptz, slot_end timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  cfg public.appointment_settings%rowtype;
  weekday_key text := extract(isodow from p_date)::integer::text;
  working_period jsonb;
  period_start time;
  period_end time;
  candidate timestamptz;
  candidate_end timestamptz;
  candidate_occupied_until timestamptz;
begin
  select * into cfg from public.appointment_settings where id = true;
  if not found then return; end if;
  if p_date < (now() at time zone cfg.timezone)::date
    or p_date > (now() at time zone cfg.timezone)::date + cfg.booking_window_days then
    return;
  end if;

  for working_period in select value from jsonb_array_elements(coalesce(cfg.weekly_schedule -> weekday_key, '[]'::jsonb))
  loop
    period_start := (working_period ->> 0)::time;
    period_end := (working_period ->> 1)::time;
    candidate := (p_date + period_start) at time zone cfg.timezone;
    while candidate + make_interval(mins => cfg.duration_minutes) <= ((p_date + period_end) at time zone cfg.timezone)
    loop
      candidate_end := candidate + make_interval(mins => cfg.duration_minutes);
      candidate_occupied_until := candidate_end + make_interval(mins => cfg.buffer_minutes);
      if candidate >= now() + make_interval(hours => cfg.minimum_notice_hours)
        and not exists (
          select 1 from public.appointment_blocks b
          where tstzrange(b.start_at, b.end_at, '[)') && tstzrange(candidate, candidate_occupied_until, '[)')
        )
        and not exists (
          select 1 from public.appointments a
          where a.status in ('pending', 'confirmed')
            and tstzrange(a.start_at, a.occupied_until, '[)') && tstzrange(candidate, candidate_occupied_until, '[)')
        )
      then
        slot_start := candidate;
        slot_end := candidate_end;
        return next;
      end if;
      candidate := candidate_occupied_until;
    end loop;
  end loop;
end;
$$;

create or replace function public.get_booking_availability(p_start_date date, p_end_date date)
returns table (local_date date, available_count integer, slots jsonb, duration_minutes integer, maximum_companions integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  cfg public.appointment_settings%rowtype;
begin
  select * into cfg from public.appointment_settings where id = true;
  if not found or p_end_date < p_start_date or p_end_date > p_start_date + 42 then return; end if;
  return query
  select d::date,
    count(s.slot_start)::integer,
    coalesce(jsonb_agg(jsonb_build_object(
      'start', s.slot_start,
      'end', s.slot_end,
      'label', to_char(s.slot_start at time zone cfg.timezone, 'HH24:MI')
    ) order by s.slot_start) filter (where s.slot_start is not null), '[]'::jsonb),
    cfg.duration_minutes,
    cfg.maximum_companions
  from generate_series(p_start_date, p_end_date, interval '1 day') d
  left join lateral public.appointment_slots_for_date(d::date) s on true
  group by d, cfg.duration_minutes, cfg.maximum_companions
  order by d;
end;
$$;

create or replace function public.book_appointment(
  p_local_date date,
  p_local_time time,
  p_customer_name text,
  p_phone text,
  p_email text,
  p_appointment_type text,
  p_companions integer,
  p_comment text,
  p_privacy_consent boolean,
  p_idempotency_key uuid,
  p_product_id text default null,
  p_product_name text default null,
  p_source text default 'other',
  p_current_url text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cfg public.appointment_settings%rowtype;
  starts_at_value timestamptz;
  ends_at_value timestamptz;
  occupied_until_value timestamptz;
  normalized_phone_value text := regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g');
  appointment_id uuid;
begin
  select * into cfg from public.appointment_settings where id = true for share;
  if not found then raise exception 'booking_not_configured'; end if;
  if not p_privacy_consent then raise exception 'privacy_consent_required'; end if;
  if char_length(trim(coalesce(p_customer_name, ''))) not between 2 and 120 then raise exception 'invalid_name'; end if;
  if char_length(normalized_phone_value) not between 7 and 30 then raise exception 'invalid_phone'; end if;
  if coalesce(p_email, '') <> '' and (char_length(p_email) > 254 or p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$') then raise exception 'invalid_email'; end if;
  if p_appointment_type not in ('bridal', 'formal', 'accessories', 'other') then raise exception 'invalid_type'; end if;
  if p_companions < 0 or p_companions > cfg.maximum_companions then raise exception 'invalid_companions'; end if;
  if char_length(coalesce(p_comment, '')) > 1000 then raise exception 'invalid_comment'; end if;
  if coalesce(p_source, 'other') not in ('home', 'contact', 'product', 'blog', 'gallery', 'collection', 'accessories', 'about', 'other') then raise exception 'invalid_source'; end if;
  if char_length(coalesce(p_product_id, '')) > 160 or char_length(coalesce(p_product_name, '')) > 160 or char_length(coalesce(p_current_url, '')) > 500 then raise exception 'invalid_context'; end if;
  if coalesce(p_current_url, '') <> '' and (left(p_current_url, 1) <> '/' or left(p_current_url, 2) = '//') then raise exception 'invalid_url'; end if;

  select slot_start, slot_end into starts_at_value, ends_at_value
  from public.appointment_slots_for_date(p_local_date)
  where (slot_start at time zone cfg.timezone)::time = p_local_time
  limit 1;
  if starts_at_value is null then raise exception 'slot_unavailable'; end if;
  occupied_until_value := ends_at_value + make_interval(mins => cfg.buffer_minutes);

  if (
    select count(*) from public.appointments
    where normalized_phone = normalized_phone_value and created_at > now() - interval '30 minutes'
  ) >= 3 then raise exception 'rate_limit'; end if;

  insert into public.appointments (
    start_at, end_at, occupied_until, timezone, customer_name, phone, normalized_phone,
    email, appointment_type, companions, comment, product_id, product_name, source,
    current_url, status, privacy_consent_at, idempotency_key
  ) values (
    starts_at_value, ends_at_value, occupied_until_value, cfg.timezone, trim(p_customer_name),
    trim(p_phone), normalized_phone_value, nullif(trim(coalesce(p_email, '')), ''),
    p_appointment_type, p_companions, nullif(trim(coalesce(p_comment, '')), ''),
    nullif(trim(coalesce(p_product_id, '')), ''), nullif(trim(coalesce(p_product_name, '')), ''),
    coalesce(nullif(trim(coalesce(p_source, '')), ''), 'other'),
    nullif(trim(coalesce(p_current_url, '')), ''), 'confirmed', now(), p_idempotency_key
  ) returning id into appointment_id;

  return jsonb_build_object('id', appointment_id, 'start', starts_at_value, 'end', ends_at_value);
exception
  when exclusion_violation then raise exception 'slot_unavailable';
  when unique_violation then
    select id into appointment_id from public.appointments where idempotency_key = p_idempotency_key;
    return jsonb_build_object('id', appointment_id, 'duplicate', true);
end;
$$;

revoke all on function public.appointment_slots_for_date(date) from public;
revoke all on function public.get_booking_availability(date, date) from public;
revoke all on function public.book_appointment(date, time, text, text, text, text, integer, text, boolean, uuid, text, text, text, text) from public;
grant execute on function public.get_booking_availability(date, date) to anon, authenticated;
grant execute on function public.book_appointment(date, time, text, text, text, text, integer, text, boolean, uuid, text, text, text, text) to anon, authenticated;
