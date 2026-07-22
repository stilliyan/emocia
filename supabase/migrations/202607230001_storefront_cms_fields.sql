alter table public.products
  add column if not exists price numeric(10, 2),
  add column if not exists silhouette text,
  add column if not exists accessory_category text;

alter table public.site_settings
  add column if not exists tiktok_url text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_price_nonnegative') then
    alter table public.products add constraint products_price_nonnegative check (price is null or price >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_silhouette_valid') then
    alter table public.products add constraint products_silhouette_valid check (silhouette is null or silhouette in ('a-line', 'mermaid', 'princess', 'straight'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_accessory_category_valid') then
    alter table public.products add constraint products_accessory_category_valid check (accessory_category is null or accessory_category in ('veils', 'hair', 'jewellery', 'gloves', 'glasses', 'shoes', 'decorations'));
  end if;
end $$;
