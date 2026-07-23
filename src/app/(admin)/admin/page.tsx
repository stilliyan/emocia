import { Dashboard } from "@/components/dashboard";
import { calendarRange } from "@/lib/calendar";
import { getCalendarEvents, getContactInquiries, getProducts, getUpcomingAppointments } from "@/lib/data";
import type { Appointment, AppointmentRequest, CalendarEvent } from "@/lib/data";

export default async function DashboardPage() {
  const now = new Date();
  const range = calendarRange(new Date(now.getFullYear(), now.getMonth(), 1));
  const products = await getProducts();
  let events: CalendarEvent[] = [];
  let appointments: Appointment[] = [];
  let inquiries: AppointmentRequest[] = [];
  let calendarError = "";
  let appointmentError = "";
  let inquiryError = "";
  try {
    events = await getCalendarEvents(range.start, range.end);
  } catch (error) {
    calendarError = error instanceof Error ? error.message : "Събитията не могат да бъдат заредени.";
  }
  try {
    appointments = await getUpcomingAppointments();
  } catch (error) {
    appointmentError = error instanceof Error ? error.message : "Записванията не могат да бъдат заредени.";
  }
  try {
    inquiries = await getContactInquiries();
  } catch (error) {
    inquiryError = error instanceof Error ? error.message : "Запитванията не могат да бъдат заредени.";
  }
  return <Dashboard products={products} initialEvents={events} initialAppointments={appointments} initialInquiries={inquiries} initialCalendarError={calendarError} initialAppointmentError={appointmentError} initialInquiryError={inquiryError} />;
}
