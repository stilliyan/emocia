import { AppointmentManager } from "@/components/appointment-manager";
import { PageHeader } from "@/components/page-header";
import { getAppointmentManagementData } from "@/lib/data";

export default async function AppointmentsPage() {
  let data: Awaited<ReturnType<typeof getAppointmentManagementData>> | null = null;
  let message = "";
  try {
    data = await getAppointmentManagementData();
  } catch (error) {
    message = error instanceof Error ? error.message : "Записванията не могат да бъдат заредени.";
  }
  return <div className="space-y-5"><PageHeader title="Записвания" description="Управлявайте часовете, почивните периоди и работния график." />{data ? <AppointmentManager {...data} /> : <div className="rounded-lg border bg-card p-5 text-sm"><p className="font-medium">Необходима е настройка на базата данни</p><p className="mt-2 text-muted-foreground">{message}</p><p className="mt-3 text-muted-foreground">Изпълнете локално migration файла <code>202607230002_appointment_booking.sql</code>. Production не е променен.</p></div>}</div>;
}
