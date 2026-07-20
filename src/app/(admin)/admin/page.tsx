import { Dashboard } from "@/components/dashboard";
import { calendarRange } from "@/lib/calendar";
import { getAppointmentRequests, getCalendarEvents, getProducts } from "@/lib/data";
import type { AppointmentRequest, CalendarEvent } from "@/lib/data";

export default async function DashboardPage() {
  const now = new Date();
  const range = calendarRange(new Date(now.getFullYear(), now.getMonth(), 1));
  const products = await getProducts();
  let events: CalendarEvent[] = [];
  let requests: AppointmentRequest[] = [];
  let calendarError = "";
  let appointmentError = "";
  try {
    events = await getCalendarEvents(range.start, range.end);
  } catch (error) {
    calendarError = error instanceof Error ? error.message : "Събитията не могат да бъдат заредени.";
  }
  try {
    requests = await getAppointmentRequests();
  } catch (error) {
    appointmentError = error instanceof Error ? error.message : "Заявките не могат да бъдат заредени.";
  }
  return <Dashboard products={products} initialEvents={events} initialRequests={requests} initialCalendarError={calendarError} initialAppointmentError={appointmentError} />;
}
