# Supabase admin setup

## First: create the CMS schema

If the application reports that `public.profiles` cannot be found, the project is connected but the schema has not been installed. In **Supabase Dashboard → SQL Editor**, paste and run the complete contents of:

```text
supabase/manual-setup.sql
```

This one-time file includes the full initial migration, the approved admin UUID, the three default categories, and verification queries. Do not run only the admin insert against an empty project because `public.profiles` does not exist yet.

## Why an authenticated user is not automatically an admin

GitHub login creates a user in Supabase Auth (`auth.users`). Admin authorization is intentionally stored separately in `public.profiles`. A user is an admin only when `public.profiles.id` matches the Auth user UUID and `role = 'admin'`.

The application does not promote every authenticated user. This keeps production access closed even when another OAuth user can authenticate.

## Find the GitHub user's UUID

In Supabase Dashboard open **Authentication → Users**, select the GitHub user, and copy **User UID**. The CMS access-denied screen also displays the current authenticated User ID and email.

You can inspect GitHub Auth users in **SQL Editor**:

```sql
select
  id,
  email,
  raw_app_meta_data ->> 'provider' as provider,
  created_at
from auth.users
order by created_at;
```

## Grant admin access

Replace `PASTE_AUTH_USER_UUID_HERE` with the exact User UID, then run this once in **Supabase → SQL Editor**:

```sql
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
```

Verify the result:

```sql
select
  u.id,
  u.email,
  u.raw_app_meta_data ->> 'provider' as provider,
  p.role
from auth.users u
left join public.profiles p on p.id = u.id
where u.id = 'PASTE_AUTH_USER_UUID_HERE'::uuid;
```

The result must show `role = admin`. Reload `/admin` afterward; signing out is normally unnecessary.

## Initial categories

The initial migration creates the default categories. This idempotent query ensures the requested development set exists without producing duplicate slugs:

```sql
insert into public.categories (name, slug, sort_order, active)
values
  ('Булчински рокли', 'bulchinski-rokli', 10, true),
  ('Вечерни рокли', 'vecherni-rokli', 20, true),
  ('Аксесоари', 'aksesoari', 30, true)
on conflict (slug) do update
set name = excluded.name,
    sort_order = excluded.sort_order,
    active = true;
```

## Production safety

Run the grant query only for approved owners. Do not add a public trigger that promotes every new Auth user, do not expose a service-role key in Next.js public environment variables, and do not disable RLS. To revoke access, delete the user's row from `public.profiles` or disable the Auth user.
