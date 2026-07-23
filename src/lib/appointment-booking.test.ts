import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { bookingInputSchema, generateSlotsForDate, getCalendarCells, sofiaLocalToUtc, type AvailabilityRules } from "./appointment-booking";

const rules: AvailabilityRules = {
  durationMinutes: 60,
  bufferMinutes: 15,
  minimumNoticeHours: 0,
  weeklySchedule: { "1": [["10:00", "13:00"]], "2": [["10:00", "13:00"]], "3": [["10:00", "13:00"]], "4": [["10:00", "13:00"]], "5": [["10:00", "13:00"]], "6": [], "7": [] },
};
const before = new Date("2026-01-01T00:00:00Z");

describe("appointment availability", () => {
  it("does not expose past slots", () => {
    expect(generateSlotsForDate("2025-12-31", rules, [], [], before)).toEqual([]);
  });

  it("closes days missing from the weekly schedule", () => {
    expect(generateSlotsForDate("2026-01-03", rules, [], [], before)).toEqual([]);
  });

  it("removes a fully blocked date and a partially blocked interval", () => {
    const full = [{ start: "2026-01-02T00:00:00Z", end: "2026-01-03T00:00:00Z" }];
    expect(generateSlotsForDate("2026-01-02", rules, full, [], before)).toEqual([]);
    const firstSlotStart = sofiaLocalToUtc("2026-01-02", "10:00").toISOString();
    const firstSlotEnd = sofiaLocalToUtc("2026-01-02", "11:15").toISOString();
    const partial = generateSlotsForDate("2026-01-02", rules, [{ start: firstSlotStart, end: firstSlotEnd }], [], before);
    expect(partial.map((slot) => slot.label)).not.toContain("10:00");
  });

  it("uses duration plus buffer when stepping through the day", () => {
    expect(generateSlotsForDate("2026-01-02", rules, [], [], before).map((slot) => slot.label)).toEqual(["10:00", "11:15"]);
  });

  it("marks a fully booked date unavailable and lets cancelled appointments release the slot", () => {
    const slots = generateSlotsForDate("2026-01-02", rules, [], [], before);
    const occupied = slots.map((slot) => ({ start: slot.start, end: new Date(new Date(slot.end).getTime() + 15 * 60000).toISOString(), status: "confirmed" as const }));
    expect(generateSlotsForDate("2026-01-02", rules, [], occupied, before)).toEqual([]);
    expect(generateSlotsForDate("2026-01-02", rules, [], occupied.map((item) => ({ ...item, status: "cancelled" as const })), before)).toHaveLength(2);
  });

  it("handles month boundaries", () => {
    const cells = getCalendarCells(2026, 1);
    expect(cells.filter(Boolean)).toHaveLength(28);
    expect(cells.find(Boolean)).toBe("2026-02-01");
  });

  it("uses the correct Sofia offsets on both sides of daylight-saving time", () => {
    expect(sofiaLocalToUtc("2026-01-15", "10:00").toISOString()).toBe("2026-01-15T08:00:00.000Z");
    expect(sofiaLocalToUtc("2026-07-15", "10:00").toISOString()).toBe("2026-07-15T07:00:00.000Z");
  });
});

describe("booking validation and database protection", () => {
  const valid = {
    localDate: "2026-07-24", localTime: "10:00", name: "Мария Иванова", phone: "+359888123456",
    email: "", appointmentType: "bridal", companions: 2, comment: "", privacyConsent: true,
    idempotencyKey: "6d90f8ae-293f-44be-b0e6-ff4c58562d7e", productId: "", productName: "",
    source: "home", currentUrl: "/", website: "",
  };

  it("accepts a valid booking and rejects manipulated values", () => {
    expect(bookingInputSchema.safeParse(valid).success).toBe(true);
    expect(bookingInputSchema.safeParse({ ...valid, localTime: "javascript:bad" }).success).toBe(false);
  });

  it("requires privacy consent and enforces the companion hard limit", () => {
    expect(bookingInputSchema.safeParse({ ...valid, privacyConsent: false }).success).toBe(false);
    expect(bookingInputSchema.safeParse({ ...valid, companions: 11 }).success).toBe(false);
  });

  it("requires an idempotency key to prevent duplicate form submissions", () => {
    expect(bookingInputSchema.safeParse({ ...valid, idempotencyKey: "duplicate" }).success).toBe(false);
  });

  it("protects simultaneous requests with a database exclusion constraint", () => {
    const migration = readFileSync("supabase/migrations/202607230002_appointment_booking.sql", "utf8");
    expect(migration).toContain("appointments_no_active_overlap");
    expect(migration).toContain("exclude using gist");
    expect(migration).toContain("when exclusion_violation then raise exception 'slot_unavailable'");
    expect(migration).toContain("idempotency_key uuid not null unique");
  });
});
