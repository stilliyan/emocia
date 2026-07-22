create table if not exists public.order_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  phone text not null check (char_length(phone) between 7 and 30),
  delivery_details text not null check (char_length(delivery_details) between 5 and 500),
  message text,
  product_slug text not null check (char_length(product_slug) between 1 and 120),
  product_name text not null check (char_length(product_name) between 1 and 160),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists order_requests_status_created_idx
on public.order_requests(status, created_at desc);

create index if not exists order_requests_phone_created_idx
on public.order_requests(phone, created_at desc);

drop trigger if exists order_requests_touch on public.order_requests;
create trigger order_requests_touch
before update on public.order_requests
for each row execute function public.touch_updated_at();

alter table public.order_requests enable row level security;

drop policy if exists "admin order requests select" on public.order_requests;
create policy "admin order requests select"
on public.order_requests for select to authenticated
using (public.is_admin());

drop policy if exists "admin order requests update" on public.order_requests;
create policy "admin order requests update"
on public.order_requests for update to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin order requests delete" on public.order_requests;
create policy "admin order requests delete"
on public.order_requests for delete to authenticated
using (public.is_admin());

revoke all on public.order_requests from anon;
grant select, update, delete on public.order_requests to authenticated;

create or replace function public.submit_order_request(
  p_name text,
  p_phone text,
  p_delivery_details text,
  p_message text,
  p_product_slug text,
  p_product_name text,
  p_unit_price numeric
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
  if char_length(trim(coalesce(p_delivery_details, ''))) not between 5 and 500 then
    raise exception 'invalid_delivery_details';
  end if;
  if char_length(coalesce(p_message, '')) > 1000
    or char_length(trim(coalesce(p_product_slug, ''))) not between 1 and 120
    or char_length(trim(coalesce(p_product_name, ''))) not between 1 and 160
    or p_unit_price is null
    or p_unit_price < 0 then
    raise exception 'invalid_content';
  end if;
  if (
    select count(*)
    from public.order_requests
    where regexp_replace(phone, '[^0-9+]', '', 'g') = normalized_phone
      and created_at > now() - interval '30 minutes'
  ) >= 3 then
    raise exception 'rate_limit';
  end if;

  insert into public.order_requests (
    name,
    phone,
    delivery_details,
    message,
    product_slug,
    product_name,
    unit_price
  ) values (
    trim(p_name),
    trim(p_phone),
    trim(p_delivery_details),
    nullif(trim(coalesce(p_message, '')), ''),
    trim(p_product_slug),
    trim(p_product_name),
    p_unit_price
  ) returning id into request_id;

  return request_id;
end;
$$;

revoke all on function public.submit_order_request(text, text, text, text, text, text, numeric) from public;
grant execute on function public.submit_order_request(text, text, text, text, text, text, numeric) to anon, authenticated;
