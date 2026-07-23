"use server";

import { revalidatePath } from "next/cache";
import { bookingInputSchema, monthDateRange, type BookingAvailability, type BookingDay } from "@/lib/appointment-booking";
import { appointmentRequestSchema, appointmentStatusSchema, entityIdSchema } from "@/lib/schemas";
import { createClient, getAdminErrorMessage, requireAdmin } from "@/lib/supabase/server";

export type AppointmentRequestState = { error?: string; success?: string; id?: string; testMode?: boolean };
export type BookingActionState = {
  error?: string;
  success?: string;
  id?: string;
  start?: string;
  end?: string;
  duplicate?: boolean;
  slotUnavailable?: boolean;
  setupRequired?: boolean;
  testMode?: boolean;
};

const text = (form: FormData, key: string) => String(form.get(key) ?? "");

function normalizeInternalPath(value: string) {
  const path = value.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return "";
  return path.slice(0, 500);
}

function isAllowedDate(date: string) {
  const selected = new Date(`${date}T12:00:00Z`);
  const today = new Date();
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 180);
  return selected >= start && selected <= end;
}

function defaultAppointmentDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function missingBookingSchema(error: { code?: string; message?: string } | null) {
  return Boolean(error && (
    error.code === "PGRST202" ||
    error.code === "42883" ||
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    error.message?.includes("get_booking_availability") ||
    error.message?.includes("book_appointment")
  ));
}

function demoAvailability(start: string, end: string): BookingAvailability {
  const days: BookingDay[] = [];
  const cursor = new Date(`${start}T12:00:00Z`);
  const last = new Date(`${end}T12:00:00Z`);
  const now = new Date();
  while (cursor <= last) {
    const date = cursor.toISOString().slice(0, 10);
    const weekday = cursor.getUTCDay();
    const available = weekday !== 0 && new Date(`${date}T19:00:00+03:00`) > now;
    const slots = available ? ["10:00", "11:15", "12:30", "14:00", "15:15", "16:30", "17:45"].filter((label) => new Date(`${date}T${label}:00+03:00`) > now).map((label) => ({
      label,
      start: `${date}T${label}:00+03:00`,
      end: new Date(new Date(`${date}T${label}:00+03:00`).getTime() + 60 * 60 * 1000).toISOString(),
    })) : [];
    days.push({ date, availableCount: slots.length, slots });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return { days, durationMinutes: 60, maximumCompanions: 3, address: "гр. Варна, бул. Вл. Варненчик 69" };
}

export async function getBookingAvailability(input: { year: number; monthIndex: number }): Promise<{ data?: BookingAvailability; error?: string; setupRequired?: boolean }> {
  if (!Number.isInteger(input.year) || !Number.isInteger(input.monthIndex) || input.monthIndex < 0 || input.monthIndex > 11) {
    return { error: "Невалиден месец." };
  }
  const { start, end } = monthDateRange(input.year, input.monthIndex);
  if (process.env.APPOINTMENT_SUBMISSION_MODE !== "live") return { data: demoAvailability(start, end) };
  try {
    const supabase = await createClient();
    const [{ data, error }, settingsResult] = await Promise.all([
      supabase.rpc("get_booking_availability", { p_start_date: start, p_end_date: end }),
      supabase.from("site_settings").select("address").eq("id", true).maybeSingle(),
    ]);
    if (error) {
      if (missingBookingSchema(error)) return { error: "Онлайн записването все още не е активирано.", setupRequired: true };
      return { error: "Свободните часове не могат да бъдат заредени." };
    }
    if (settingsResult.error) return { error: "Адресът на бутика не може да бъде зареден." };
    const rows = (data ?? []) as Array<{ local_date: string; available_count: number; slots: Array<{ start: string; end: string; label: string }>; duration_minutes: number; maximum_companions: number }>;
    return {
      data: {
        days: rows.map((row) => ({ date: row.local_date, availableCount: row.available_count, slots: row.slots ?? [] })),
        durationMinutes: rows[0]?.duration_minutes ?? 60,
        maximumCompanions: rows[0]?.maximum_companions ?? 0,
        address: settingsResult.data?.address || "гр. Варна, бул. Вл. Варненчик 69",
      },
    };
  } catch {
    return { error: "Свободните часове не могат да бъдат заредени." };
  }
}

export async function bookAppointment(input: unknown): Promise<BookingActionState> {
  const parsed = bookingInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (parsed.data.website) return { success: "Записването е потвърдено." };
  if (parsed.data.currentUrl && (!parsed.data.currentUrl.startsWith("/") || parsed.data.currentUrl.startsWith("//"))) {
    return { error: "Невалиден адрес на страницата." };
  }

  if (process.env.APPOINTMENT_SUBMISSION_MODE !== "live") {
    const availability = demoAvailability(parsed.data.localDate, parsed.data.localDate);
    const slot = availability.days[0]?.slots.find((item) => item.label === parsed.data.localTime);
    if (!slot) return { error: "Този час вече не е свободен. Изберете друг.", slotUnavailable: true };
    return {
      id: parsed.data.idempotencyKey,
      start: slot.start,
      end: slot.end,
      testMode: true,
      success: "Тестовото записване е успешно. Не е създадена реална резервация.",
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("book_appointment", {
      p_local_date: parsed.data.localDate,
      p_local_time: parsed.data.localTime,
      p_customer_name: parsed.data.name,
      p_phone: parsed.data.phone,
      p_email: parsed.data.email || null,
      p_appointment_type: parsed.data.appointmentType,
      p_companions: parsed.data.companions,
      p_comment: parsed.data.comment || null,
      p_privacy_consent: parsed.data.privacyConsent,
      p_idempotency_key: parsed.data.idempotencyKey,
      p_product_id: parsed.data.productId || null,
      p_product_name: parsed.data.productName || null,
      p_source: parsed.data.source,
      p_current_url: parsed.data.currentUrl || null,
    });
    if (error) {
      if (missingBookingSchema(error)) return { error: "Онлайн записването все още не е активирано.", setupRequired: true };
      if (error.message.includes("slot_unavailable") || error.code === "23P01") return { error: "Този час току-що беше зает. Изберете друг свободен час.", slotUnavailable: true };
      if (error.message.includes("rate_limit")) return { error: "Изпратихте няколко заявки. Изчакайте малко и опитайте отново." };
      if (error.message.includes("invalid_companions")) return { error: "Избраният брой придружители не е позволен." };
      return { error: "Записването не можа да бъде завършено. Опитайте отново." };
    }
    const result = data as { id: string; start?: string; end?: string; duplicate?: boolean };
    const createdFromAdmin = (parsed.data.currentUrl ?? "").startsWith("/admin/");
    return {
      id: result.id,
      start: result.start,
      end: result.end,
      duplicate: result.duplicate,
      success: createdFromAdmin
        ? "Записването е създадено."
        : "Заявката за час е изпратена. Очаквайте потвърждение по телефона.",
    };
  } catch {
    return { error: "Записването не можа да бъде завършено. Опитайте отново." };
  }
}

export async function changeAppointmentStatus(id: string, status: string): Promise<BookingActionState> {
  const parsedId = entityIdSchema.safeParse(id);
  const parsedStatus = appointmentStatusSchema.safeParse(status);
  if (!parsedId.success || !parsedStatus.success) return { error: "Невалидно записване." };
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("appointments").update({ status: parsedStatus.data }).eq("id", parsedId.data);
    if (error) {
      if (missingBookingSchema(error)) return { error: "Записванията изискват последната Supabase migration.", setupRequired: true };
      return { error: "Статусът не можа да бъде променен." };
    }
    revalidatePath("/admin");
    revalidatePath("/admin/appointments");
    return { success: "Статусът беше обновен." };
  } catch (error) {
    return { error: getAdminErrorMessage(error) };
  }
}

export async function createAppointmentBlock(input: { startAt: string; endAt: string; reason?: string }): Promise<BookingActionState> {
  const start = new Date(input.startAt);
  const end = new Date(input.endAt);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) return { error: "Въведете валиден период." };
  if ((input.reason?.length ?? 0) > 500) return { error: "Причината е твърде дълга." };
  try {
    const { supabase, user } = await requireAdmin();
    const { error } = await supabase.from("appointment_blocks").insert({ start_at: start.toISOString(), end_at: end.toISOString(), reason: input.reason?.trim() || null, created_by: user.id });
    if (error) {
      if (missingBookingSchema(error)) return { error: "Блокирането изисква последната Supabase migration.", setupRequired: true };
      return { error: "Периодът не можа да бъде блокиран." };
    }
    revalidatePath("/admin/appointments");
    return { success: "Периодът беше блокиран." };
  } catch (error) {
    return { error: getAdminErrorMessage(error) };
  }
}

export async function saveAppointmentSettings(input: {
  durationMinutes: number;
  bufferMinutes: number;
  maximumCompanions: number;
  bookingWindowDays: number;
  minimumNoticeHours: number;
  weeklySchedule: Record<string, Array<[string, string]>>;
}): Promise<BookingActionState> {
  const validNumber = (value: number, min: number, max: number) => Number.isInteger(value) && value >= min && value <= max;
  if (!validNumber(input.durationMinutes, 15, 240) || !validNumber(input.bufferMinutes, 0, 120) || !validNumber(input.maximumCompanions, 0, 10) || !validNumber(input.bookingWindowDays, 1, 365) || !validNumber(input.minimumNoticeHours, 0, 720)) {
    return { error: "Проверете числовите настройки." };
  }
  for (const day of Object.keys(input.weeklySchedule)) {
    if (!/^[1-7]$/.test(day) || input.weeklySchedule[day].some(([from, to]) => !/^\d{2}:\d{2}$/.test(from) || !/^\d{2}:\d{2}$/.test(to) || from >= to)) {
      return { error: "Проверете работното време." };
    }
  }
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("appointment_settings").upsert({
      id: true,
      timezone: "Europe/Sofia",
      duration_minutes: input.durationMinutes,
      buffer_minutes: input.bufferMinutes,
      maximum_companions: input.maximumCompanions,
      booking_window_days: input.bookingWindowDays,
      minimum_notice_hours: input.minimumNoticeHours,
      weekly_schedule: input.weeklySchedule,
    });
    if (error) {
      if (missingBookingSchema(error)) return { error: "Настройките изискват последната Supabase migration.", setupRequired: true };
      return { error: "Настройките не можаха да бъдат запазени." };
    }
    revalidatePath("/admin/appointments");
    return { success: "Настройките бяха запазени." };
  } catch (error) {
    return { error: getAdminErrorMessage(error) };
  }
}

export async function submitAppointmentRequest(form: FormData): Promise<AppointmentRequestState> {
  const parsed = appointmentRequestSchema.safeParse({
    name: text(form, "name"),
    phone: text(form, "phone"),
    preferred_date: text(form, "preferred_date"),
    preferred_time: text(form, "preferred_time"),
    message: text(form, "message"),
    product_name: text(form, "product_name"),
    product_id: text(form, "product_id"),
    source: text(form, "source") || "other",
    current_url: text(form, "current_url"),
    privacy_consent: text(form, "privacy_consent") === "true",
    website: text(form, "website"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const isContactInquiry = parsed.data.source === "contact";
  if (parsed.data.website) {
    return { success: isContactInquiry ? "Получихме вашето запитване." : "Получихме вашата заявка." };
  }
  const preferredDate = parsed.data.preferred_date || defaultAppointmentDate();
  const preferredTime = parsed.data.preferred_time || "10:00";
  if (!isAllowedDate(preferredDate)) return { error: "Изберете дата в следващите 6 месеца." };
  const [hour] = preferredTime.split(":").map(Number);
  if (hour < 10 || hour > 18) return { error: "Изберете час между 10:00 и 18:00." };

  const mode = process.env.APPOINTMENT_SUBMISSION_MODE === "live" ? "live" : "test";
  if (mode === "test") {
    return {
      testMode: true,
      success: isContactInquiry
        ? "Данните са проверени успешно, но запитването не е изпратено в тестов режим."
        : "Данните са проверени успешно, но не са изпратени. Екипът няма да получи тази тестова заявка.",
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("submit_appointment_request", {
      p_name: parsed.data.name,
      p_phone: parsed.data.phone,
      p_preferred_date: preferredDate,
      p_preferred_time: preferredTime,
      p_message: parsed.data.message || null,
      p_product_name: parsed.data.product_name || null,
      p_product_id: parsed.data.product_id || null,
      p_source: parsed.data.source,
      p_current_url: normalizeInternalPath(parsed.data.current_url ?? "") || null,
    });
    if (error) {
      if (error.message.includes("rate_limit")) return { error: "Изпратихте няколко заявки. Изчакайте малко и опитайте отново." };
      if (error.code === "PGRST202" || error.code === "42883") {
        return { error: isContactInquiry ? "Формата за запитвания временно не е настроена." : "Записването временно не е настроено." };
      }
      return { error: "Заявката не можа да бъде изпратена. Опитайте отново." };
    }
    return {
      id: String(data),
      success: isContactInquiry
        ? "Получихме вашето запитване. Ще се свържем с вас по телефона."
        : "Получихме вашата заявка. Ще се свържем с вас за потвърждение на часа.",
    };
  } catch {
    return { error: "Заявката не можа да бъде изпратена. Опитайте отново." };
  }
}

export async function confirmAppointmentRequest(id: string): Promise<AppointmentRequestState> {
  const parsed = entityIdSchema.safeParse(id);
  if (!parsed.success) return { error: "Невалидна заявка." };
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase.rpc("confirm_appointment_request", { p_request_id: parsed.data });
    if (error) {
      if (error.message.includes("slot_conflict")) return { error: "Този час вече е зает. Изберете друг час преди потвърждение." };
      if (error.code === "PGRST202" || error.code === "42883") return { error: "Заявките за проба изискват Supabase migration." };
      return { error: "Заявката не можа да бъде потвърдена." };
    }
    revalidatePath("/admin");
    return { id: String(data), success: "Заявката е потвърдена и добавена в календара." };
  } catch (error) {
    return { error: getAdminErrorMessage(error) };
  }
}

export async function cancelAppointmentRequest(id: string): Promise<AppointmentRequestState> {
  const parsed = entityIdSchema.safeParse(id);
  if (!parsed.success) return { error: "Невалидна заявка." };
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("appointment_requests").update({ status: "cancelled" }).eq("id", parsed.data).eq("status", "pending");
    if (error) return { error: "Заявката не можа да бъде отказана." };
    revalidatePath("/admin");
    return { success: "Заявката е отказана." };
  } catch (error) {
    return { error: getAdminErrorMessage(error) };
  }
}

export async function markAppointmentInquiryHandled(id: string): Promise<AppointmentRequestState> {
  const parsed = entityIdSchema.safeParse(id);
  if (!parsed.success) return { error: "Невалидно запитване." };
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("appointment_requests")
      .update({ status: "confirmed" })
      .eq("id", parsed.data)
      .eq("source", "contact")
      .eq("status", "pending");
    if (error) return { error: "Запитването не можа да бъде отбелязано като обработено." };
    revalidatePath("/admin");
    return { success: "Запитването е отбелязано като обработено." };
  } catch (error) {
    return { error: getAdminErrorMessage(error) };
  }
}
