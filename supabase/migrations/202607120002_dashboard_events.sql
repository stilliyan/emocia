create table if not exists public.dashboard_events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 160),
  type text not null check (type in ('fitting','meeting','pickup','deadline','order','note')),
  status text not null default 'upcoming' check (status in ('upcoming','completed','cancelled')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  all_day boolean not null default false,
  client_name text,
  client_phone text,
  notes text,
  product_id uuid references public.products(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dashboard_events_valid_range check (ends_at is null or ends_at >= starts_at)
);

create index if not exists dashboard_events_starts_at_idx on public.dashboard_events(starts_at);
create index if not exists dashboard_events_product_idx on public.dashboard_events(product_id) where product_id is not null;
drop trigger if exists dashboard_events_touch on public.dashboard_events;
create trigger dashboard_events_touch before update on public.dashboard_events for each row execute function public.touch_updated_at();

alter table public.dashboard_events enable row level security;
drop policy if exists "admin dashboard events" on public.dashboard_events;
create policy "admin dashboard events" on public.dashboard_events for all to authenticated using(public.is_admin()) with check(public.is_admin());
