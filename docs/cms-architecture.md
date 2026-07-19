# CMS architecture

Next.js App Router and strict TypeScript provide server-first routes. `src/app/(auth)` contains login; `src/app/(admin)/admin` is protected by `proxy.ts` and server authorization. Mutations are Server Actions using shared Zod schemas. Supabase supplies Auth, PostgreSQL, and the public `product-images` bucket; clients are created lazily so builds work without credentials.

`src/lib/supabase` owns browser/server clients. `src/lib/data` contains reusable queries; public consumers must use only published rows and public-safe columns. Admin routes are `/admin`, `/admin/products`, `/admin/products/new`, `/admin/products/[id]`, `/admin/products/[id]/preview`, `/admin/categories`, `/admin/content`, and `/admin/settings`.

The database enforces slugs, foreign keys, timestamps and RLS. UI route protection is not treated as authorization: the admin layout and each write verify an authenticated profile with role `admin`. OAuth authentication creates `auth.users` only; approved users are promoted manually with the idempotent query in `SUPABASE_SETUP.md`.

## Public storefront

The public `/` route is a static, server-rendered storefront assembled from reusable components in `src/components/storefront`. Brand images exported from the approved Figma design live in `public/storefront` and are rendered through `next/image`. Until the public Supabase catalogue contract is connected, the homepage product rail uses typed presentation data from `src/lib/storefront-data.ts`; it does not query or expose admin-only data.
