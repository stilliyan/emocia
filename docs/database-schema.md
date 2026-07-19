# Database schema

- `profiles`: auth user id, role (`admin`), display name.
- `categories`: UUID, Bulgarian name, unique slug, sort order, active flag, timestamps.
- `products`: UUID, category relation, name/slug, descriptions, status (`draft`, `published`, `archived`), featured, attributes, SEO, ordering and lifecycle timestamps.
- `product_images`: product relation, storage path, alt/caption, sort order, cover flag, size/type/hash metadata.
- `site_content`: singleton homepage/about/contact content.
- `site_settings`: singleton shop defaults, SEO, social image and contact/social links.

Category deletion is restricted while products reference it. Product deletion cascades image records; storage objects are removed by the application. Public reads are limited to active categories, published products/images, and singleton public content/settings. Admin writes require an authenticated admin profile.

