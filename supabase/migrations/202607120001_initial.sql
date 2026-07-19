create extension if not exists pgcrypto;
create type public.product_status as enum ('draft','published','archived');

create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, role text not null default 'admin' check (role='admin'), display_name text, created_at timestamptz not null default now());
create table public.categories (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, sort_order integer not null default 0, active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.products (
 id uuid primary key default gen_random_uuid(), category_id uuid not null references public.categories(id) on delete restrict,
 name text not null, slug text not null unique, short_description text, description text, status public.product_status not null default 'draft', featured boolean not null default false,
 product_code text, sizes text[] not null default '{}', color text, material text, collection text, year integer check(year between 1900 and 2200), sort_order integer not null default 0,
 seo_title text, meta_description text, canonical_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), published_at timestamptz, archived_at timestamptz
);
create table public.product_images (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade, storage_path text not null unique, alt_text text not null default '', caption text, sort_order integer not null default 0, is_cover boolean not null default false, mime_type text, byte_size bigint, content_hash text, created_at timestamptz not null default now());
create unique index one_cover_per_product on public.product_images(product_id) where is_cover;
create index products_category_idx on public.products(category_id); create index products_status_updated_idx on public.products(status,updated_at desc); create index product_images_order_idx on public.product_images(product_id,sort_order);
create table public.site_content (id boolean primary key default true check(id), hero_title text, hero_description text, hero_image_path text, about_title text, about_content text, contact_phone text, contact_email text, address text, working_hours text, instagram_url text, facebook_url text, maps_url text, updated_at timestamptz not null default now());
create table public.site_settings (id boolean primary key default true check(id), shop_name text not null default 'Емоция', default_seo_title text, default_meta_description text, social_image_path text, contact_phone text, contact_email text, address text, working_hours text, instagram_url text, facebook_url text, maps_url text, updated_at timestamptz not null default now());

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin') $$;
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create trigger categories_touch before update on public.categories for each row execute function public.touch_updated_at();
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security; alter table public.categories enable row level security; alter table public.products enable row level security; alter table public.product_images enable row level security; alter table public.site_content enable row level security; alter table public.site_settings enable row level security;
create policy "own profile" on public.profiles for select to authenticated using(id=auth.uid());
create policy "public active categories" on public.categories for select using(active or public.is_admin());
create policy "admin categories" on public.categories for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "public published products" on public.products for select using(status='published' or public.is_admin());
create policy "admin products" on public.products for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "public published images" on public.product_images for select using(exists(select 1 from public.products p where p.id=product_id and (p.status='published' or public.is_admin())));
create policy "admin images" on public.product_images for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "public content" on public.site_content for select using(true); create policy "admin content" on public.site_content for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "public settings" on public.site_settings for select using(true); create policy "admin settings" on public.site_settings for all to authenticated using(public.is_admin()) with check(public.is_admin());

insert into public.categories(name,slug,sort_order,active)
values ('Булчински рокли','bulchinski-rokli',10,true),('Вечерни рокли','vecherni-rokli',20,true),('Аксесоари','aksesoari',30,true)
on conflict(slug) do update set name=excluded.name, sort_order=excluded.sort_order, active=excluded.active;
insert into public.site_content(id) values(true) on conflict do nothing; insert into public.site_settings(id) values(true) on conflict do nothing;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('product-images','product-images',true,10485760,array['image/jpeg','image/png','image/webp','image/avif']) on conflict(id) do update set file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;
create policy "public product media" on storage.objects for select using(bucket_id='product-images');
create policy "admin upload media" on storage.objects for insert to authenticated with check(bucket_id='product-images' and public.is_admin());
create policy "admin update media" on storage.objects for update to authenticated using(bucket_id='product-images' and public.is_admin());
create policy "admin delete media" on storage.objects for delete to authenticated using(bucket_id='product-images' and public.is_admin());
