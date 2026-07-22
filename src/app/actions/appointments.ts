"use server";

import { revalidatePath } from "next/cache";
import { appointmentRequestSchema, entityIdSchema } from "@/lib/schemas";
import { createClient, getAdminErrorMessage, requireAdmin } from "@/lib/supabase/server";

export type AppointmentRequestState = { error?: string; success?: string; id?: string; testMode?: boolean };

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
    website: text(form, "website"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (parsed.data.website) return { success: "Получихме вашата заявка." };
  const preferredDate = parsed.data.preferred_date || defaultAppointmentDate();
  const preferredTime = parsed.data.preferred_time || "10:00";
  if (!isAllowedDate(preferredDate)) return { error: "Изберете дата в следващите 6 месеца." };
  const [hour] = preferredTime.split(":").map(Number);
  if (hour < 10 || hour > 18) return { error: "Изберете час между 10:00 и 18:00." };

  const mode = process.env.APPOINTMENT_SUBMISSION_MODE === "live" ? "live" : "test";
  if (mode === "test") {
    return {
      testMode: true,
      success: "Данните са проверени успешно, но не са изпратени. Екипът няма да получи тази тестова заявка.",
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
      if (error.code === "PGRST202" || error.code === "42883") return { error: "Записването временно не е настроено." };
      return { error: "Заявката не можа да бъде изпратена. Опитайте отново." };
    }
    return { id: String(data), success: "Получихме вашата заявка. Ще се свържем с вас за потвърждение на часа." };
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
