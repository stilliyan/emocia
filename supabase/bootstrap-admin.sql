-- Manual, one-time bootstrap. Never run with an unverified user UUID.
-- Replace PASTE_AUTH_USER_UUID_HERE with Authentication > Users > User UID.
insert into public.profiles (id, role, display_name)
select
  id,
  'admin',
  coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name', email)
from auth.users
where id = 'PASTE_AUTH_USER_UUID_HERE'::uuid
on conflict (id) do update
set role = excluded.role,
    display_name = coalesce(public.profiles.display_name, excluded.display_name);

insert into public.categories (name, slug, sort_order, active)
values
  ('Булчински рокли', 'bulchinski-rokli', 10, true),
  ('Вечерни рокли', 'vecherni-rokli', 20, true),
  ('Аксесоари', 'aksesoari', 30, true)
on conflict (slug) do update
set name = excluded.name,
    sort_order = excluded.sort_order,
    active = true;

