-- Emotion CMS: complete one-time manual setup for the linked Supabase project.
-- Run the complete file in Supabase Dashboard > SQL Editor.

-- A. Full initial database migration
begin;

create extension if not exists pgcrypto;
create type public.product_status as enum ('draft','published','archived');

create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, role text not null default 'admin' check (role='admin'), display_name text, created_at timestamptz not null default now());
create table public.categories (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, sort_order integer not null default 0, active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.products (
 id uuid primary key default gen_random_uuid(), category_id uuid not null references public.categories(id) on delete restrict,
 name text not null, slug text not null unique, short_description text, description text, status public.product_status not null default 'draft', featured boolean not null default false,
 product_code text, sizes text[] not null default '{}', color text, material text, collection text, year integer check(year between 1900 and 2200), price numeric(10,2) check(price is null or price >= 0), silhouette text check(silhouette is null or silhouette in ('a-line','mermaid','princess','straight')), accessory_category text check(accessory_category is null or accessory_category in ('veils','hair','jewellery','gloves','glasses','shoes','decorations')), sort_order integer not null default 0,
 seo_title text, meta_description text, canonical_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), published_at timestamptz, archived_at timestamptz
);
create table public.product_images (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade, storage_path text not null unique, alt_text text not null default '', caption text, sort_order integer not null default 0, is_cover boolean not null default false, mime_type text, byte_size bigint, content_hash text, created_at timestamptz not null default now());
create unique index one_cover_per_product on public.product_images(product_id) where is_cover;
create index products_category_idx on public.products(category_id);
create index products_status_updated_idx on public.products(status,updated_at desc);
create index product_images_order_idx on public.product_images(product_id,sort_order);

create table public.site_content (id boolean primary key default true check(id), hero_title text, hero_description text, hero_image_path text, about_title text, about_content text, contact_phone text, contact_email text, address text, working_hours text, instagram_url text, facebook_url text, maps_url text, updated_at timestamptz not null default now());
create table public.site_settings (id boolean primary key default true check(id), shop_name text not null default 'Емоция', default_seo_title text, default_meta_description text, social_image_path text, contact_phone text, contact_email text, address text, working_hours text, instagram_url text, facebook_url text, tiktok_url text, maps_url text, updated_at timestamptz not null default now());
create table public.calendar_events (
 id uuid primary key default gen_random_uuid(), title text not null check(char_length(title) between 2 and 160),
 description text, start_at timestamptz not null, end_at timestamptz, all_day boolean not null default false,
 color text, status text not null default 'upcoming' check(status in ('upcoming','completed','cancelled')),
 created_by uuid not null references auth.users(id) on delete restrict,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 constraint calendar_events_valid_range check(end_at is null or end_at>=start_at)
);
create index calendar_events_start_at_idx on public.calendar_events(start_at);
create index calendar_events_created_by_idx on public.calendar_events(created_by);
create table public.appointment_requests (
 id uuid primary key default gen_random_uuid(), name text not null check(char_length(name) between 2 and 120),
 phone text not null check(char_length(phone) between 7 and 30), preferred_date date not null, preferred_time time not null,
 message text, product_name text, status text not null default 'pending' check(status in ('pending','confirmed','cancelled')),
 calendar_event_id uuid references public.calendar_events(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index appointment_requests_status_date_idx on public.appointment_requests(status,preferred_date,preferred_time);
create index appointment_requests_phone_created_idx on public.appointment_requests(phone,created_at desc);

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin') $$;
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create trigger categories_touch before update on public.categories for each row execute function public.touch_updated_at();
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();
create trigger calendar_events_touch before update on public.calendar_events for each row execute function public.touch_updated_at();
create trigger appointment_requests_touch before update on public.appointment_requests for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.site_content enable row level security;
alter table public.site_settings enable row level security;
alter table public.calendar_events enable row level security;
alter table public.appointment_requests enable row level security;

create policy "own profile" on public.profiles for select to authenticated using(id=auth.uid());
create policy "public active categories" on public.categories for select using(active or public.is_admin());
create policy "admin categories" on public.categories for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "public published products" on public.products for select using(status='published' or public.is_admin());
create policy "admin products" on public.products for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "public published images" on public.product_images for select using(exists(select 1 from public.products p where p.id=product_id and (p.status='published' or public.is_admin())));
create policy "admin images" on public.product_images for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "public content" on public.site_content for select using(true);
create policy "admin content" on public.site_content for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "public settings" on public.site_settings for select using(true);
create policy "admin settings" on public.site_settings for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admin calendar events select" on public.calendar_events for select to authenticated using(public.is_admin());
create policy "admin calendar events insert" on public.calendar_events for insert to authenticated with check(public.is_admin() and created_by=auth.uid());
create policy "admin calendar events update" on public.calendar_events for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admin calendar events delete" on public.calendar_events for delete to authenticated using(public.is_admin());
create policy "admin appointment requests select" on public.appointment_requests for select to authenticated using(public.is_admin());
create policy "admin appointment requests update" on public.appointment_requests for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admin appointment requests delete" on public.appointment_requests for delete to authenticated using(public.is_admin());
revoke all on public.appointment_requests from anon;
grant select,update,delete on public.appointment_requests to authenticated;

create or replace function public.submit_appointment_request(p_name text,p_phone text,p_preferred_date date,p_preferred_time time,p_message text default null,p_product_name text default null)
returns uuid language plpgsql security definer set search_path=public as $$
declare request_id uuid; normalized_phone text:=regexp_replace(coalesce(p_phone,''),'[^0-9+]','','g');
begin
 if char_length(trim(coalesce(p_name,''))) not between 2 and 120 then raise exception 'invalid_name'; end if;
 if char_length(normalized_phone) not between 7 and 30 then raise exception 'invalid_phone'; end if;
 if p_preferred_date<current_date or p_preferred_date>current_date+180 then raise exception 'invalid_date'; end if;
 if p_preferred_time<time '10:00' or p_preferred_time>time '18:00' then raise exception 'invalid_time'; end if;
 if char_length(coalesce(p_message,''))>1000 or char_length(coalesce(p_product_name,''))>160 then raise exception 'invalid_content'; end if;
 if (select count(*) from public.appointment_requests where regexp_replace(phone,'[^0-9+]','','g')=normalized_phone and created_at>now()-interval '30 minutes')>=3 then raise exception 'rate_limit'; end if;
 insert into public.appointment_requests(name,phone,preferred_date,preferred_time,message,product_name)
 values(trim(p_name),trim(p_phone),p_preferred_date,p_preferred_time,nullif(trim(coalesce(p_message,'')),''),nullif(trim(coalesce(p_product_name,'')),'')) returning id into request_id;
 return request_id;
end $$;
revoke all on function public.submit_appointment_request(text,text,date,time,text,text) from public;
grant execute on function public.submit_appointment_request(text,text,date,time,text,text) to anon,authenticated;

create or replace function public.confirm_appointment_request(p_request_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare request_row public.appointment_requests%rowtype; starts_at timestamptz; ends_at timestamptz; event_id uuid;
begin
 if not public.is_admin() then raise exception 'forbidden'; end if;
 select * into request_row from public.appointment_requests where id=p_request_id for update;
 if not found or request_row.status<>'pending' then raise exception 'invalid_request'; end if;
 starts_at:=(request_row.preferred_date+request_row.preferred_time) at time zone 'Europe/Sofia'; ends_at:=starts_at+interval '1 hour';
 if exists(select 1 from public.calendar_events where status='upcoming' and start_at<ends_at and coalesce(end_at,start_at+interval '1 hour')>starts_at) then raise exception 'slot_conflict'; end if;
 insert into public.calendar_events(title,description,start_at,end_at,all_day,color,status,created_by)
 values('Проба — '||request_row.name,concat_ws(E'\n','Телефон: '||request_row.phone,case when request_row.product_name is not null then 'Модел: '||request_row.product_name end,request_row.message),starts_at,ends_at,false,'#111111','upcoming',auth.uid()) returning id into event_id;
 update public.appointment_requests set status='confirmed',calendar_event_id=event_id where id=request_row.id;
 return event_id;
end $$;
revoke all on function public.confirm_appointment_request(uuid) from public;
grant execute on function public.confirm_appointment_request(uuid) to authenticated;

insert into public.categories(name,slug,sort_order,active)
values ('Булчински рокли','bulchinski-rokli',10,true),('Вечерни рокли','vecherni-rokli',20,true),('Аксесоари','aksesoari',30,true)
on conflict(slug) do update set name=excluded.name, sort_order=excluded.sort_order, active=excluded.active;
insert into public.site_content(id) values(true) on conflict do nothing;
insert into public.site_settings(id) values(true) on conflict do nothing;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('product-images','product-images',true,10485760,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict(id) do update set file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;
create policy "public product media" on storage.objects for select using(bucket_id='product-images');
create policy "admin upload media" on storage.objects for insert to authenticated with check(bucket_id='product-images' and public.is_admin());
create policy "admin update media" on storage.objects for update to authenticated using(bucket_id='product-images' and public.is_admin());
create policy "admin delete media" on storage.objects for delete to authenticated using(bucket_id='product-images' and public.is_admin());

-- B. Bootstrap the approved current Auth user as admin
insert into public.profiles (id, role, display_name)
select
  id,
  'admin',
  coalesce(
    raw_user_meta_data ->> 'full_name',
    raw_user_meta_data ->> 'name',
    email
  )
from auth.users
where id = 'b8ef9a40-c2e4-46b1-b317-5d5605cff9fb'::uuid
on conflict (id) do update
set role = excluded.role,
    display_name = coalesce(
      public.profiles.display_name,
      excluded.display_name
    );

-- C. Seed/update the required default categories
insert into public.categories (name, slug, sort_order, active)
values
  ('Булчински рокли', 'bulchinski-rokli', 10, true),
  ('Вечерни рокли', 'vecherni-rokli', 20, true),
  ('Аксесоари', 'aksesoari', 30, true)
on conflict (slug) do update
set name = excluded.name,
    sort_order = excluded.sort_order,
    active = true;

commit;

-- D. Verification queries
select
  u.id,
  u.email,
  u.raw_app_meta_data ->> 'provider' as provider,
  p.role
from auth.users u
left join public.profiles p on p.id = u.id
where u.id = 'b8ef9a40-c2e4-46b1-b317-5d5605cff9fb'::uuid;

select
  to_regclass('public.profiles') as profiles_table,
  to_regclass('public.categories') as categories_table,
  to_regclass('public.products') as products_table,
  to_regclass('public.product_images') as product_images_table,
  to_regclass('public.calendar_events') as calendar_events_table,
  to_regclass('public.appointment_requests') as appointment_requests_table;

select name, slug, sort_order, active
from public.categories
where slug in ('bulchinski-rokli', 'vecherni-rokli', 'aksesoari')
order by sort_order;

select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'product-images';
