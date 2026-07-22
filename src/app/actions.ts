"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { calendarEventSchema, calendarRangeSchema, categorySchema, entityIdSchema, entityIdsSchema, eventStatusSchema, productSchema, siteContentSchema, siteSettingsSchema, statusSchema } from "@/lib/schemas";
import type { CalendarEvent } from "@/lib/data";
import { createClient, getAdminErrorMessage, requireAdmin } from "@/lib/supabase/server";

type ActionState = { error?: string; success?: string; id?: string };
const val = (form: FormData, key: string) => String(form.get(key) ?? "");

export async function loginAction(_: unknown, form: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: val(form, "email"),
    password: val(form, "password"),
  });
  if (error) return { error: "Невалиден имейл или парола." };
  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function saveSiteSettings(_: unknown, form: FormData): Promise<ActionState> {
  const parsed = siteSettingsSchema.safeParse({
    shop_name: val(form, "shop_name"), address: val(form, "address"), working_hours: val(form, "working_hours"),
    contact_phone: val(form, "contact_phone"), contact_email: val(form, "contact_email"),
    instagram_url: val(form, "instagram_url"), facebook_url: val(form, "facebook_url"), tiktok_url: val(form, "tiktok_url"), maps_url: val(form, "maps_url"),
    default_seo_title: val(form, "default_seo_title"), default_meta_description: val(form, "default_meta_description"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("site_settings").upsert({ id: true, ...parsed.data });
    if ((error?.code === "42703" || error?.code === "PGRST204") && parsed.data.tiktok_url) return { error: "Преди да запазите TikTok адрес, приложете последната Supabase migration." };
    if (error?.code === "42703" || error?.code === "PGRST204") {
      const { tiktok_url: _tiktokUrl, ...legacySettings } = parsed.data;
      void _tiktokUrl;
      const legacyResult = await supabase.from("site_settings").upsert({ id: true, ...legacySettings });
      if (legacyResult.error) return { error: "Настройките не можаха да бъдат запазени." };
    } else if (error) return { error: "Настройките не можаха да бъдат запазени." };
    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");
    return { success: "Настройките бяха запазени." };
  } catch (error) {
    return { error: getAdminErrorMessage(error) };
  }
}

export async function saveSiteContent(_: unknown, form: FormData): Promise<ActionState> {
  const parsed = siteContentSchema.safeParse({
    hero_title: val(form, "hero_title"), hero_description: val(form, "hero_description"),
    about_title: val(form, "about_title"), about_content: val(form, "about_content"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("site_content").upsert({ id: true, ...parsed.data });
    if (error) return { error: "Съдържанието не можа да бъде запазено." };
    revalidatePath("/admin/content");
    revalidatePath("/", "layout");
    return { success: "Съдържанието беше запазено." };
  } catch (error) {
    return { error: getAdminErrorMessage(error) };
  }
}

export async function getCalendarEvents(range: { start: string; end: string }): Promise<{ data?: CalendarEvent[]; error?: string }> {
  const parsed = calendarRangeSchema.safeParse(range);
  if (!parsed.success) return { error: "Невалиден календарен период." };
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase.from("calendar_events").select("*").gte("start_at", parsed.data.start).lt("start_at", parsed.data.end).order("start_at");
    if (error) return { error: error.code === "42P01" || error.code === "PGRST205" ? "Календарът изисква Supabase migration." : "Събитията не могат да бъдат заредени." };
    return { data: (data ?? []) as CalendarEvent[] };
  } catch (error) {
    return { error: getAdminErrorMessage(error) };
  }
}

export async function saveCalendarEvent(input: unknown): Promise<ActionState> {
  const parsed = calendarEventSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    const { supabase, user } = await requireAdmin();
    const payload = {
      title: parsed.data.title, description: parsed.data.description || null, status: parsed.data.status,
      start_at: parsed.data.startsAt, end_at: parsed.data.endsAt || null, all_day: parsed.data.allDay,
      color: parsed.data.color || null,
    };
    const result = parsed.data.id
      ? await supabase.from("calendar_events").update(payload).eq("id", parsed.data.id)
      : await supabase.from("calendar_events").insert({ ...payload, created_by: user.id });
    if (result.error) return { error: result.error.code === "42P01" || result.error.code === "PGRST205" ? "Календарът изисква Supabase migration." : "Събитието не можа да бъде запазено." };
    revalidatePath("/admin");
    return { success: parsed.data.id ? "Събитието беше обновено." : "Събитието беше създадено." };
  } catch (error) {
    return { error: getAdminErrorMessage(error) };
  }
}

export async function changeCalendarEventStatus(id: string, status: string): Promise<ActionState> {
  const parsedId = entityIdSchema.safeParse(id);
  const parsedStatus = eventStatusSchema.safeParse(status);
  if (!parsedId.success || !parsedStatus.success) return { error: "Невалидно събитие." };
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("calendar_events").update({ status: parsedStatus.data }).eq("id", parsedId.data);
    if (error) return { error: "Статусът не можа да бъде променен." };
    revalidatePath("/admin");
    return { success: parsedStatus.data === "completed" ? "Събитието е завършено." : parsedStatus.data === "cancelled" ? "Събитието е отказано." : "Събитието е възстановено." };
  } catch (error) {
    return { error: getAdminErrorMessage(error) };
  }
}

export async function deleteCalendarEvent(id: string): Promise<ActionState> {
  const parsed = entityIdSchema.safeParse(id);
  if (!parsed.success) return { error: "Невалидно събитие." };
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("calendar_events").delete().eq("id", parsed.data);
    if (error) return { error: "Събитието не можа да бъде изтрито." };
    revalidatePath("/admin");
    return { success: "Събитието беше изтрито." };
  } catch (error) {
    return { error: getAdminErrorMessage(error) };
  }
}

export async function saveCategory(_: unknown, form: FormData): Promise<ActionState> {
  const parsed = categorySchema.safeParse({
    name: val(form, "name"),
    slug: val(form, "slug"),
    active: form.get("active") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const { supabase } = await requireAdmin();
    const id = val(form, "id");
    const result = id
      ? await supabase.from("categories").update(parsed.data).eq("id", id)
      : await supabase.from("categories").insert(parsed.data);
    if (result.error) {
      return { error: result.error.code === "23505" ? "Този адрес вече се използва." : result.error.message };
    }
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products/new");
    return { success: "Категорията е запазена." };
  } catch (error) {
    return { error: getAdminErrorMessage(error) };
  }
}

export async function deleteCategory(id: string): Promise<ActionState> {
  const parsedId = entityIdSchema.safeParse(id);
  if (!parsedId.success) return { error: "Неуспешно изтриване на категория." };
  try {
    const { supabase } = await requireAdmin();
    const { count, error: countError } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", parsedId.data);
    if (countError) return { error: "Неуспешно изтриване на категория." };
    if (count) return { error: "Категория с продукти не може да бъде изтрита." };
    const { error } = await supabase.from("categories").delete().eq("id", parsedId.data);
    if (error) return { error: "Неуспешно изтриване на категория." };
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products/new");
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return { success: "Категорията беше изтрита." };
  } catch (error) {
    const adminMessage = getAdminErrorMessage(error);
    return { error: adminMessage === "Профилът няма администраторски права." || adminMessage === "Моля, влезте в профила си." ? adminMessage : "Неуспешно изтриване на категория." };
  }
}

export async function saveProduct(_: unknown, form: FormData): Promise<ActionState> {
  const year = val(form, "year");
  const price = val(form, "price");
  const parsed = productSchema.safeParse({
    name: val(form, "name"), slug: val(form, "slug"), short_description: val(form, "short_description"),
    description: val(form, "description"), category_id: val(form, "category_id"), status: val(form, "status") || "draft",
    featured: form.get("featured") === "on", product_code: val(form, "product_code"),
    sizes: val(form, "sizes").split(",").map((item) => item.trim()).filter(Boolean), color: val(form, "color"),
    material: val(form, "material"), collection: val(form, "collection"), year: year ? Number(year) : undefined,
    price: price ? Number(price) : undefined, silhouette: val(form, "silhouette"), accessory_category: val(form, "accessory_category"),
    seo_title: val(form, "seo_title"), meta_description: val(form, "meta_description"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const { supabase } = await requireAdmin();
    const id = val(form, "id");
    const payload = {
      ...parsed.data,
      published_at: parsed.data.status === "published" ? new Date().toISOString() : null,
      archived_at: parsed.data.status === "archived" ? new Date().toISOString() : null,
    };
    let result = id
      ? await supabase.from("products").update(payload).eq("id", id).select("id").single()
      : await supabase.from("products").insert(payload).select("id").single();
    if ((result.error?.code === "42703" || result.error?.code === "PGRST204") && (parsed.data.price !== undefined || parsed.data.silhouette || parsed.data.accessory_category)) {
      return { error: "Преди да запазите цена, силует или тип аксесоар, приложете последната Supabase migration." };
    }
    if (result.error?.code === "42703" || result.error?.code === "PGRST204") {
      const { price: _price, silhouette: _silhouette, accessory_category: _accessoryCategory, ...legacyPayload } = payload;
      void _price; void _silhouette; void _accessoryCategory;
      result = id
        ? await supabase.from("products").update(legacyPayload).eq("id", id).select("id").single()
        : await supabase.from("products").insert(legacyPayload).select("id").single();
    }
    if (result.error) return { error: result.error.code === "23505" ? "Този адрес вече се използва." : result.error.message };
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return { success: "Продуктът е запазен.", id: result.data.id };
  } catch (error) {
    return { error: getAdminErrorMessage(error) };
  }
}

export async function changeProductStatus(id: string, status: string) {
  const valid = statusSchema.parse(status);
  const { supabase } = await requireAdmin();
  await supabase.from("products").update({
    status: valid,
    published_at: valid === "published" ? new Date().toISOString() : null,
    archived_at: valid === "archived" ? new Date().toISOString() : null,
  }).eq("id", id);
  revalidatePath("/admin/products");
}

async function deleteProductsByIds(ids: string[]): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const { data: images, error: imageError } = await supabase.from("product_images").select("storage_path").in("product_id", ids);
    if (imageError) return { error: ids.length === 1 ? "Неуспешно изтриване на продукт." : "Неуспешно изтриване на избраните продукти." };

    const { error: deleteError } = await supabase.from("products").delete().in("id", ids);
    if (deleteError) return { error: ids.length === 1 ? "Неуспешно изтриване на продукт." : "Неуспешно изтриване на избраните продукти." };

    const paths = (images ?? []).map((image) => image.storage_path);
    if (paths.length) {
      const { error: storageError } = await supabase.storage.from("product-images").remove(paths);
      if (storageError) console.warn("Product storage cleanup failed", { type: storageError.name, message: storageError.message.slice(0, 160) });
    }
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    return { success: ids.length === 1 ? "Продуктът беше изтрит." : "Избраните продукти бяха изтрити." };
  } catch (error) {
    const adminMessage = getAdminErrorMessage(error);
    if (adminMessage === "Профилът няма администраторски права." || adminMessage === "Моля, влезте в профила си.") return { error: adminMessage };
    return { error: ids.length === 1 ? "Неуспешно изтриване на продукт." : "Неуспешно изтриване на избраните продукти." };
  }
}

export async function deleteProduct(id: string): Promise<ActionState> {
  const parsed = entityIdSchema.safeParse(id);
  if (!parsed.success) return { error: "Неуспешно изтриване на продукт." };
  return deleteProductsByIds([parsed.data]);
}

export async function deleteProducts(ids: string[]): Promise<ActionState> {
  const parsed = entityIdsSchema.safeParse(ids);
  if (!parsed.success) return { error: "Неуспешно изтриване на избраните продукти." };
  return deleteProductsByIds([...new Set(parsed.data)]);
}

export async function registerProductImage(input: {
  productId: string;
  storagePath: string;
  altText: string;
  mimeType: string;
  byteSize: number;
}): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const { data: product } = await supabase.from("products").select("id").eq("id", input.productId).single();
    if (!product) return { error: "Продуктът не е намерен." };

    const { data: lastImage, error: orderError } = await supabase
      .from("product_images")
      .select("sort_order")
      .eq("product_id", input.productId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (orderError) return { error: orderError.message };

    const { count } = await supabase
      .from("product_images")
      .select("id", { count: "exact", head: true })
      .eq("product_id", input.productId);

    const { error } = await supabase.from("product_images").insert({
      product_id: input.productId,
      storage_path: input.storagePath,
      alt_text: input.altText.trim(),
      sort_order: (lastImage?.sort_order ?? -1) + 1,
      is_cover: (count ?? 0) === 0,
      mime_type: input.mimeType,
      byte_size: input.byteSize,
    });
    if (error) return { error: error.message };
    revalidatePath(`/admin/products/${input.productId}`);
    revalidatePath("/admin");
    return { success: "Снимката е качена успешно." };
  } catch (error) {
    return { error: getAdminErrorMessage(error) };
  }
}

export async function setPrimaryProductImage(productId: string, imageId: string): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const { data: image } = await supabase.from("product_images").select("id").eq("id", imageId).eq("product_id", productId).single();
    if (!image) return { error: "Снимката не е намерена." };
    const { error: clearError } = await supabase.from("product_images").update({ is_cover: false }).eq("product_id", productId);
    if (clearError) return { error: clearError.message };
    const { error } = await supabase.from("product_images").update({ is_cover: true }).eq("id", imageId).eq("product_id", productId);
    if (error) return { error: error.message };
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/admin/products");
    return { success: "Основната снимка е променена." };
  } catch (error) {
    return { error: getAdminErrorMessage(error) };
  }
}

export async function deleteProductImage(productId: string, imageId: string): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const { data: image, error: findError } = await supabase.from("product_images").select("storage_path,is_cover").eq("id", imageId).eq("product_id", productId).single();
    if (findError || !image) return { error: "Снимката не е намерена." };
    const { error: storageError } = await supabase.storage.from("product-images").remove([image.storage_path]);
    if (storageError) return { error: `Файлът не може да бъде изтрит: ${storageError.message}` };
    const { error } = await supabase.from("product_images").delete().eq("id", imageId).eq("product_id", productId);
    if (error) return { error: error.message };
    if (image.is_cover) {
      const { data: next } = await supabase.from("product_images").select("id").eq("product_id", productId).order("sort_order").limit(1).maybeSingle();
      if (next) await supabase.from("product_images").update({ is_cover: true }).eq("id", next.id);
    }
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/admin/products");
    revalidatePath("/admin");
    return { success: "Снимката е изтрита." };
  } catch (error) {
    return { error: getAdminErrorMessage(error) };
  }
}

export async function reorderProductImages(productId: string, orderedIds: string[]): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const { data } = await supabase.from("product_images").select("id").eq("product_id", productId);
    const existing = new Set((data ?? []).map((image) => image.id));
    if (orderedIds.length !== existing.size || orderedIds.some((id) => !existing.has(id))) return { error: "Невалиден ред на снимките." };
    for (const [sortOrder, id] of orderedIds.entries()) {
      const { error } = await supabase.from("product_images").update({ sort_order: sortOrder }).eq("id", id).eq("product_id", productId);
      if (error) return { error: error.message };
    }
    revalidatePath(`/admin/products/${productId}`);
    return { success: "Редът на снимките е запазен." };
  } catch (error) {
    return { error: getAdminErrorMessage(error) };
  }
}
