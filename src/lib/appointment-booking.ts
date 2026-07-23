import { z } from "zod";

export const APPOINTMENT_TIME_ZONE = "Europe/Sofia";
export const APPOINTMENT_TYPES = ["bridal", "formal", "accessories", "other"] as const;
export const appointmentTypeLabels: Record<(typeof APPOINTMENT_TYPES)[number], string> = {
  bridal: "Булчинска рокля",
  formal: "Официална рокля",
  accessories: "Аксесоари",
  other: "Друго",
};

export type BookingSlot = { start: string; end: string; label: string };
export type BookingDay = {
  date: string;
  availableCount: number;
  slots: BookingSlot[];
};
export type BookingAvailability = {
  days: BookingDay[];
  durationMinutes: number;
  maximumCompanions: number;
  address: string;
  setupRequired?: boolean;
};

export const bookingInputSchema = z.object({
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Изберете дата."),
  localTime: z.string().regex(/^\d{2}:\d{2}$/, "Изберете час."),
  name: z.string().trim().min(2, "Въведете вашите имена.").max(120, "Името е твърде дълго."),
  phone: z.string().trim().min(7, "Въведете валиден телефонен номер.").max(30, "Телефонът е твърде дълъг."),
  email: z.string().trim().email("Въведете валиден имейл.").max(254).optional().or(z.literal("")),
  appointmentType: z.enum(APPOINTMENT_TYPES, { message: "Изберете тип на пробата." }),
  companions: z.coerce.number().int().min(0, "Броят придружители не може да е отрицателен.").max(10),
  comment: z.string().trim().max(1000, "Коментарът е твърде дълъг.").optional().or(z.literal("")),
  privacyConsent: z.literal(true, { message: "Необходимо е съгласие с политиката за поверителност." }),
  idempotencyKey: z.string().uuid(),
  productId: z.string().trim().max(160).optional().or(z.literal("")),
  productName: z.string().trim().max(160).optional().or(z.literal("")),
  source: z.enum(["home", "contact", "product", "blog", "gallery", "collection", "accessories", "about", "other"]),
  currentUrl: z.string().trim().max(500).optional().or(z.literal("")),
  website: z.string().max(0).optional().or(z.literal("")),
});

export function bulgarianDate(date: string, options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long", year: "numeric" }) {
  return new Intl.DateTimeFormat("bg-BG", { ...options, timeZone: APPOINTMENT_TIME_ZONE }).format(new Date(`${date}T12:00:00+03:00`));
}

export function monthDateRange(year: number, monthIndex: number) {
  const start = `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
  const endDate = new Date(Date.UTC(year, monthIndex + 1, 0));
  const end = `${endDate.getUTCFullYear()}-${String(endDate.getUTCMonth() + 1).padStart(2, "0")}-${String(endDate.getUTCDate()).padStart(2, "0")}`;
  return { start, end };
}

export function getCalendarCells(year: number, monthIndex: number) {
  const first = new Date(Date.UTC(year, monthIndex, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  return [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  })] as Array<string | null>;
}

export type AvailabilityRules = {
  durationMinutes: number;
  bufferMinutes: number;
  minimumNoticeHours: number;
  weeklySchedule: Record<string, Array<[string, string]>>;
};
export type OccupiedPeriod = { start: string; end: string; status?: "pending" | "confirmed" | "cancelled" | "completed" };

function zonedParts(value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APPOINTMENT_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(value);
  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]));
}

export function sofiaLocalToUtc(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const desired = Date.UTC(year, month - 1, day, hour, minute);
  let guess = desired;
  for (let iteration = 0; iteration < 3; iteration += 1) {
    const parts = zonedParts(new Date(guess));
    const represented = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    guess += desired - represented;
  }
  return new Date(guess);
}

export function generateSlotsForDate(date: string, rules: AvailabilityRules, blocks: OccupiedPeriod[], appointments: OccupiedPeriod[], now: Date) {
  const localNoon = sofiaLocalToUtc(date, "12:00");
  const isoWeekday = Number(new Intl.DateTimeFormat("en-US", { timeZone: APPOINTMENT_TIME_ZONE, weekday: "short" }).format(localNoon) === "Sun"
    ? 7
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(new Intl.DateTimeFormat("en-US", { timeZone: APPOINTMENT_TIME_ZONE, weekday: "short" }).format(localNoon)) + 1);
  const periods = rules.weeklySchedule[String(isoWeekday)] ?? [];
  const noticeBoundary = now.getTime() + rules.minimumNoticeHours * 3600000;
  const relevantAppointments = appointments.filter((period) => period.status !== "cancelled" && period.status !== "completed");
  const overlaps = (start: number, end: number, periodsToCheck: OccupiedPeriod[]) => periodsToCheck.some((period) => new Date(period.start).getTime() < end && new Date(period.end).getTime() > start);
  const slots: BookingSlot[] = [];

  for (const [from, to] of periods) {
    let cursor = sofiaLocalToUtc(date, from).getTime();
    const periodEnd = sofiaLocalToUtc(date, to).getTime();
    while (cursor + rules.durationMinutes * 60000 <= periodEnd) {
      const end = cursor + rules.durationMinutes * 60000;
      const occupiedEnd = end + rules.bufferMinutes * 60000;
      if (cursor >= noticeBoundary && !overlaps(cursor, occupiedEnd, blocks) && !overlaps(cursor, occupiedEnd, relevantAppointments)) {
        slots.push({
          start: new Date(cursor).toISOString(),
          end: new Date(end).toISOString(),
          label: new Intl.DateTimeFormat("bg-BG", { timeZone: APPOINTMENT_TIME_ZONE, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(cursor)),
        });
      }
      cursor = occupiedEnd;
    }
  }
  return slots;
}
