import { describe, expect, it } from "vitest";
import { calendarRange, monthGrid, weekRange } from "./calendar";

describe("dashboard calendar", () => {
  it("starts the grid on Monday and returns six weeks", () => {
    const days = monthGrid(new Date(2026, 6, 1));
    expect(days).toHaveLength(42);
    expect(days[0].getDay()).toBe(1);
  });

  it("returns an exclusive calendar range", () => {
    const range = calendarRange(new Date(2026, 6, 1));
    expect(new Date(range.end).getTime()).toBeGreaterThan(new Date(range.start).getTime());
  });

  it("uses Monday as the start of the week", () => {
    const range = weekRange(new Date(2026, 6, 12));
    expect(range.start.getDay()).toBe(1);
    expect((range.end.getTime() - range.start.getTime()) / 86400000).toBe(7);
  });
});
