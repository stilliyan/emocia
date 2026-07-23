import { z } from "zod";

export const statusSchema = z.enum(["draft", "published", "archived"]);
const optionalText = z.string().trim().max(5000, "Текстът е твърде дълъг").optional().or(z.literal(""));

export const productSchema = z.object({
  name: z.string().trim().min(2, "Въведете име").max(160, "Името е твърде дълго"),
  slug: z.string().trim().min(2, "Въведете адрес").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Използвайте малки латински букви, цифри и тирета"),
  short_description: z.string().trim().max(320, "Краткото описание е до 320 знака").optional().or(z.literal("")),
  description: optionalText,
  category_id: z.string().uuid("Изберете категория"),
  status: statusSchema.default("draft"),
  featured: z.coerce.boolean().default(false),
  product_code: z.string().trim().max(80).optional().or(z.literal("")),
  sizes: z.array(z.string().trim().max(30)).default([]),
  color: z.string().trim().max(100).optional().or(z.literal("")),
  material: z.string().trim().max(160).optional().or(z.literal("")),
  collection: z.string().trim().max(120).optional().or(z.literal("")),
  year: z.coerce.number().int().min(1900).max(2200).optional(),
  price: z.coerce.number().min(0, "Цената не може да бъде отрицателна").optional(),
  silhouette: z.enum(["a-line", "mermaid", "princess", "straight"]).optional().or(z.literal("")),
  accessory_category: z.enum(["veils", "hair", "jewellery", "gloves", "glasses", "shoes", "decorations"]).optional().or(z.literal("")),
  seo_title: z.string().trim().max(60, "SEO заглавието е до 60 знака").optional().or(z.literal("")),
  meta_description: z.string().trim().max(160, "Мета описанието е до 160 знака").optional().or(z.literal("")),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Въведете име").max(100),
  slug: z.string().trim().min(2, "Въведете адрес").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Използвайте малки латински букви, цифри и тирета"),
  active: z.coerce.boolean().default(true),
});

export const entityIdSchema = z.string().uuid("Невалиден идентификатор");
export const entityIdsSchema = z.array(entityIdSchema).min(1, "Изберете поне един продукт").max(100, "Можете да изтриете до 100 продукта наведнъж");

const shortSetting = z.string().trim().max(500, "Стойността е твърде дълга").optional().or(z.literal(""));
const longSetting = z.string().trim().max(5000, "Текстът е твърде дълъг").optional().or(z.literal(""));

export const siteSettingsSchema = z.object({
  shop_name: z.string().trim().min(2, "Въведете име на магазина").max(120, "Името е твърде дълго"),
  address: shortSetting,
  working_hours: shortSetting,
  contact_phone: z.string().trim().max(100, "Телефонът е твърде дълъг").optional().or(z.literal("")),
  contact_email: z.string().trim().email("Въведете валиден имейл").optional().or(z.literal("")),
  instagram_url: shortSetting,
  facebook_url: shortSetting,
  tiktok_url: shortSetting,
  maps_url: z.string().trim().max(2000, "Адресът е твърде дълъг").optional().or(z.literal("")),
  default_seo_title: z.string().trim().max(60, "SEO заглавието е до 60 знака").optional().or(z.literal("")),
  default_meta_description: z.string().trim().max(160, "Мета описанието е до 160 знака").optional().or(z.literal("")),
});

export const siteContentSchema = z.object({
  hero_title: z.string().trim().max(160, "Заглавието е твърде дълго").optional().or(z.literal("")),
  hero_description: longSetting,
  about_title: z.string().trim().max(160, "Заглавието е твърде дълго").optional().or(z.literal("")),
  about_content: longSetting,
});

export const eventStatusSchema = z.enum(["upcoming", "completed", "cancelled"]);
export const calendarEventSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2, "Въведете заглавие").max(160, "Заглавието е твърде дълго"),
  description: z.string().trim().max(5000, "Описанието е твърде дълго").optional().or(z.literal("")),
  status: eventStatusSchema.default("upcoming"),
  startsAt: z.string().datetime("Въведете начална дата и час"),
  endsAt: z.string().datetime("Въведете валиден краен час").nullable().optional(),
  allDay: z.boolean().default(false),
  color: z.string().trim().max(40, "Цветът е твърде дълъг").optional().or(z.literal("")),
}).superRefine((event, ctx) => {
  if (event.endsAt && new Date(event.endsAt) < new Date(event.startsAt)) ctx.addIssue({ code: "custom", path: ["endsAt"], message: "Крайният час не може да бъде преди началния" });
});

export const calendarRangeSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
}).refine((range) => new Date(range.end) > new Date(range.start), "Невалиден календарен период");

export const appointmentRequestSchema = z.object({
  name: z.string().trim().min(2, "Въведете вашето име").max(120, "Името е твърде дълго"),
  phone: z.string().trim().min(7, "Въведете валиден телефонен номер").max(30, "Телефонът е твърде дълъг"),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Изберете предпочитана дата").optional().or(z.literal("")),
  preferred_time: z.string().regex(/^\d{2}:\d{2}$/, "Изберете предпочитан час").optional().or(z.literal("")),
  message: z.string().trim().max(1000, "Съобщението е твърде дълго").optional().or(z.literal("")),
  product_name: z.string().trim().max(160, "Името на модела е твърде дълго").optional().or(z.literal("")),
  product_id: z.string().trim().max(160, "Идентификаторът на модела е твърде дълъг").optional().or(z.literal("")),
  source: z.enum(["home", "contact", "product", "blog", "gallery", "collection", "accessories", "about", "other"]).default("other"),
  current_url: z.string().trim().max(500, "Адресът на страницата е твърде дълъг").optional().or(z.literal("")),
  privacy_consent: z.literal(true, { message: "Необходимо е съгласие с политиката за поверителност." }),
  website: z.string().max(0).optional().or(z.literal("")),
});

export const appointmentStatusSchema = z.enum(["pending", "confirmed", "cancelled", "completed"]);

export const orderRequestSchema = z.object({
  name: z.string().trim().min(2, "Въведете вашето име").max(120, "Името е твърде дълго"),
  phone: z.string().trim().min(7, "Въведете валиден телефонен номер").max(30, "Телефонът е твърде дълъг"),
  delivery_details: z.string().trim().min(5, "Въведете град и адрес или офис на куриер").max(500, "Адресът е твърде дълъг"),
  message: z.string().trim().max(1000, "Съобщението е твърде дълго").optional().or(z.literal("")),
  product_slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Невалиден артикул"),
  website: z.string().max(0).optional().or(z.literal("")),
});

export function reorderImages<T extends { id: string }>(items: T[], activeId: string, overId: string) {
  const from = items.findIndex((item) => item.id === activeId);
  const to = items.findIndex((item) => item.id === overId);
  if (from < 0 || to < 0 || from === to) return items;
  const result = [...items];
  const [moved] = result.splice(from, 1);
  result.splice(to, 0, moved);
  return result;
}
