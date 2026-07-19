import { Dashboard } from "@/components/dashboard";
import { calendarRange } from "@/lib/calendar";
import { getCalendarEvents, getProducts } from "@/lib/data";
import type { CalendarEvent } from "@/lib/data";

export default async function DashboardPage() {
  const now = new Date();
  const range = calendarRange(new Date(now.getFullYear(), now.getMonth(), 1));
  const products = await getProducts();
  let events: CalendarEvent[] = [];
  let calendarError = "";
  try {
    events = await getCalendarEvents(range.start, range.end);
  } catch (error) {
    calendarError = error instanceof Error ? error.message : "Събитията не могат да бъдат заредени.";
  }
  return <Dashboard products={products} initialEvents={events} initialCalendarError={calendarError} />;
}
