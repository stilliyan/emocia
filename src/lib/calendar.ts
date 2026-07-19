export const SOFIA_TIME_ZONE = "Europe/Sofia";

export function dateKey(value: string | Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: SOFIA_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(typeof value === "string" ? new Date(value) : value);
}

export function monthGrid(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export function calendarRange(month: Date) {
  const days = monthGrid(month);
  const end = new Date(days[days.length - 1]);
  end.setDate(end.getDate() + 1);
  return { start: days[0].toISOString(), end: end.toISOString() };
}

export function weekRange(day: Date) {
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start, end };
}
