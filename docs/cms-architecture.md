# CMS architecture

Next.js App Router and strict TypeScript provide server-first routes. `src/app/(auth)` contains login; `src/app/(admin)/admin` is protected by `proxy.ts` and server authorization. Mutations are Server Actions using shared Zod schemas. Supabase supplies Auth, PostgreSQL, and the public `product-images` bucket; clients are created lazily so builds work without credentials.

`src/lib/supabase` owns browser/server clients. `src/lib/data` contains reusable queries; public consumers must use only published rows and public-safe columns. Admin routes are `/admin`, `/admin/products`, `/admin/products/new`, `/admin/products/[id]`, `/admin/products/[id]/preview`, `/admin/categories`, `/admin/content`, and `/admin/settings`.

The database enforces slugs, foreign keys, timestamps and RLS. UI route protection is not treated as authorization: the admin layout and each write verify an authenticated profile with role `admin`. OAuth authentication creates `auth.users` only; approved users are promoted manually with the idempotent query in `SUPABASE_SETUP.md`.

## Public storefront

The public storefront is server-rendered from the shared components in `src/components/storefront`. `src/lib/storefront-data.ts` is the public CMS boundary: it uses the Supabase anon client and RLS to read only active categories, published products/images, `site_content`, and `site_settings`. Existing typed content in `src/lib/storefront-collections.ts` remains the safe fallback when Supabase is unavailable or a CMS collection is empty. Product routes, rails, contact details, social links, homepage/about copy, and default SEO all use this boundary; admin-only data is never exposed.
