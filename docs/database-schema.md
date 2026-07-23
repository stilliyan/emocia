# Database schema

- `profiles`: auth user id, role (`admin`), display name.
- `categories`: UUID, Bulgarian name, unique slug, sort order, active flag, timestamps.
- `products`: UUID, category relation, name/slug, descriptions, status (`draft`, `published`, `archived`), featured, price, dress silhouette/accessory type, attributes, SEO, ordering and lifecycle timestamps.
- `product_images`: product relation, storage path, alt/caption, sort order, cover flag, size/type/hash metadata.
- `site_content`: singleton homepage/about/contact content.
- `site_settings`: singleton shop defaults, SEO, social image and contact/social links, including TikTok.

Category deletion is restricted while products reference it. Product deletion cascades image records; storage objects are removed by the application. Public reads are limited to active categories, published products/images, and singleton public content/settings. Admin writes require an authenticated admin profile.
# Appointment booking

Migration `202607230002_appointment_booking.sql` adds the first production-safe booking flow:

- `appointment_settings` — Sofia timezone, duration, buffer, companion limit, booking window, minimum notice and weekly schedule.
- `appointment_blocks` — complete closures and partial blocked intervals.
- `appointments` — customer booking, UTC start/end, local timezone, status and idempotency key.
- `calendar_events` — the shared CMS calendar. Migration `202607230003_appointments_calendar_sync.sql` links each appointment to one calendar event, keeps time/status/customer details synchronized and backfills existing bookings. It also enables Realtime for `appointments`, powering the admin navigation counter, the live “Нови записвания” dashboard section and the in-app notification toast.
- `appointment_requests` — contact-form inquiries remain separate from booked appointments. Pending contact messages appear in the dashboard’s “Нови запитвания” section and can be marked as handled without creating a calendar event.
- Migration `202607230004_pending_appointment_approval.sql` makes public bookings start as `pending`. They stay in “Нови записвания” until an administrator confirms them; only then is the linked calendar event created. Cancelling or completing the confirmed booking from the selected-day agenda keeps the appointment and calendar statuses synchronized.

Public clients cannot select these tables. Availability is exposed only as aggregated slots through `get_booking_availability`; creation uses `book_appointment`. Both revalidate the server-side settings. Active reservations are protected by a PostgreSQL GiST exclusion constraint over `[start_at, occupied_until)`, so concurrent inserts cannot overlap. Cancelled and completed rows do not block future availability.

The migration is intentionally additive. The older `appointment_requests` table remains for the general enquiry form and compatibility.
