create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 160),
  description text,
  start_at timestamptz not null,
  end_at timestamptz,
  all_day boolean not null default false,
  color text,
  status text not null default 'upcoming' check (status in ('upcoming', 'completed', 'cancelled')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint calendar_events_valid_range check (end_at is null or end_at >= start_at)
);

create index if not exists calendar_events_start_at_idx on public.calendar_events(start_at);
create index if not exists calendar_events_created_by_idx on public.calendar_events(created_by);

drop trigger if exists calendar_events_touch on public.calendar_events;
create trigger calendar_events_touch
before update on public.calendar_events
for each row execute function public.touch_updated_at();

alter table public.calendar_events enable row level security;

drop policy if exists "admin calendar events select" on public.calendar_events;
create policy "admin calendar events select"
on public.calendar_events for select to authenticated
using (public.is_admin());

drop policy if exists "admin calendar events insert" on public.calendar_events;
create policy "admin calendar events insert"
on public.calendar_events for insert to authenticated
with check (public.is_admin() and created_by = auth.uid());

drop policy if exists "admin calendar events update" on public.calendar_events;
create policy "admin calendar events update"
on public.calendar_events for update to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin calendar events delete" on public.calendar_events;
create policy "admin calendar events delete"
on public.calendar_events for delete to authenticated
using (public.is_admin());
