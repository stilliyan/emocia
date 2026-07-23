"use client";

import { useMemo, useState, useTransition } from "react";
import { CalendarPlus, Check, Clock3, Phone, ShieldX } from "lucide-react";
import { toast } from "sonner";
import { bookAppointment, changeAppointmentStatus, createAppointmentBlock, saveAppointmentSettings } from "@/app/actions/appointments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { appointmentTypeLabels, sofiaLocalToUtc } from "@/lib/appointment-booking";
import type { Appointment, AppointmentBlock, AppointmentSettings } from "@/lib/data";

const statusLabels = { pending: "Чакащо", confirmed: "Потвърдено", cancelled: "Отказано", completed: "Завършено" };
const weekdays = [["1", "Понеделник"], ["2", "Вторник"], ["3", "Сряда"], ["4", "Четвъртък"], ["5", "Петък"], ["6", "Събота"], ["7", "Неделя"]] as const;

export function AppointmentManager({ appointments: initialAppointments, blocks: initialBlocks, settings: initialSettings }: { appointments: Appointment[]; blocks: AppointmentBlock[]; settings: AppointmentSettings }) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [blocks, setBlocks] = useState(initialBlocks);
  const [settings, setSettings] = useState(initialSettings);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const upcoming = useMemo(() => appointments.filter((item) => item.status === "pending" || item.status === "confirmed"), [appointments]);

  function updateStatus(id: string, status: Appointment["status"]) {
    startTransition(async () => {
      const result = await changeAppointmentStatus(id, status);
      if (result.error) { toast.error(result.error); return; }
      setAppointments((current) => current.map((item) => item.id === id ? { ...item, status } : item));
      setSelected((current) => current?.id === id ? { ...current, status } : current);
      toast.success(result.success);
    });
  }

  return <Tabs defaultValue="appointments" className="space-y-4">
    <TabsList>
      <TabsTrigger value="appointments">Предстоящи</TabsTrigger>
      <TabsTrigger value="blocks">Блокирани периоди</TabsTrigger>
      <TabsTrigger value="settings">Настройки</TabsTrigger>
    </TabsList>
    <TabsContent value="appointments" className="space-y-4">
      <div className="flex justify-end"><Button type="button" onClick={() => setManualOpen(true)}><CalendarPlus />Ново записване</Button></div>
      <Card><CardHeader><div className="flex items-center justify-between"><CardTitle>Предстоящи записвания</CardTitle><Badge variant="secondary">{upcoming.length}</Badge></div></CardHeader><CardContent>
        {upcoming.length === 0 ? <p className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">Няма предстоящи записвания.</p> :
          <div className="divide-y">{upcoming.map((appointment) => <button key={appointment.id} type="button" onClick={() => setSelected(appointment)} className="grid w-full gap-2 py-4 text-left sm:grid-cols-[180px_1fr_auto] sm:items-center">
            <span><strong className="block text-sm">{formatDateTime(appointment.start_at)}</strong><span className="text-xs text-muted-foreground">{duration(appointment)} минути</span></span>
            <span className="min-w-0"><strong className="block truncate text-sm">{appointment.customer_name}</strong><span className="text-xs text-muted-foreground">{appointmentTypeLabels[appointment.appointment_type]} · {appointment.companions} придружители</span></span>
            <Badge variant={appointment.status === "confirmed" ? "default" : "outline"}>{statusLabels[appointment.status]}</Badge>
          </button>)}</div>}
      </CardContent></Card>
      <AppointmentDetails appointment={selected} open={Boolean(selected)} pending={pending} onOpenChange={(open) => !open && setSelected(null)} onStatus={updateStatus} />
      <ManualAppointmentDialog open={manualOpen} onOpenChange={setManualOpen} pending={pending} onCreated={(appointment) => setAppointments((current) => [...current, appointment].sort((a, b) => a.start_at.localeCompare(b.start_at)))} run={startTransition} maximumCompanions={settings.maximum_companions} />
    </TabsContent>
    <TabsContent value="blocks"><BlocksPanel blocks={blocks} setBlocks={setBlocks} pending={pending} run={startTransition} /></TabsContent>
    <TabsContent value="settings"><SettingsPanel settings={settings} setSettings={setSettings} pending={pending} run={startTransition} /></TabsContent>
  </Tabs>;
}

function AppointmentDetails({ appointment, open, onOpenChange, pending, onStatus }: { appointment: Appointment | null; open: boolean; onOpenChange: (open: boolean) => void; pending: boolean; onStatus: (id: string, status: Appointment["status"]) => void }) {
  if (!appointment) return null;
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>{appointment.customer_name}</DialogTitle><DialogDescription>{formatDateTime(appointment.start_at)} · {duration(appointment)} минути</DialogDescription></DialogHeader>
    <dl className="grid gap-4 rounded-lg border p-4 text-sm sm:grid-cols-2">
      <Detail label="Телефон"><a href={`tel:${appointment.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5"><Phone className="size-3.5" />{appointment.phone}</a></Detail>
      <Detail label="Имейл">{appointment.email || "—"}</Detail>
      <Detail label="Тип">{appointmentTypeLabels[appointment.appointment_type]}</Detail>
      <Detail label="Придружители">{appointment.companions}</Detail>
      <Detail label="Модел">{appointment.product_name || "—"}</Detail>
      <Detail label="Статус">{statusLabels[appointment.status]}</Detail>
      <div className="sm:col-span-2"><Detail label="Коментар">{appointment.comment || "—"}</Detail></div>
    </dl>
    <DialogFooter><Button type="button" variant="outline" disabled={pending} onClick={() => onStatus(appointment.id, "cancelled")}><ShieldX />Откажи</Button><Button type="button" variant="outline" disabled={pending} onClick={() => onStatus(appointment.id, "completed")}><Check />Завърши</Button><Button type="button" disabled={pending} onClick={() => onStatus(appointment.id, "confirmed")}>Потвърди</Button></DialogFooter>
  </DialogContent></Dialog>;
}

function ManualAppointmentDialog({ open, onOpenChange, pending, onCreated, run, maximumCompanions }: { open: boolean; onOpenChange: (open: boolean) => void; pending: boolean; onCreated: (appointment: Appointment) => void; run: React.TransitionStartFunction; maximumCompanions: number }) {
  const [draft, setDraft] = useState({ date: "", time: "", name: "", phone: "", email: "", type: "bridal", companions: 0, comment: "" });
  function submit() {
    run(async () => {
      const key = crypto.randomUUID();
      const result = await bookAppointment({ localDate: draft.date, localTime: draft.time, name: draft.name, phone: draft.phone, email: draft.email, appointmentType: draft.type, companions: draft.companions, comment: draft.comment, privacyConsent: true, idempotencyKey: key, productId: "", productName: "", source: "other", currentUrl: "/admin/appointments", website: "" });
      if (result.error || !result.id || !result.start || !result.end) { toast.error(result.error || "Записването не можа да бъде създадено."); return; }
      onCreated({ id: result.id, start_at: result.start, end_at: result.end, timezone: "Europe/Sofia", customer_name: draft.name, phone: draft.phone, email: draft.email || null, appointment_type: draft.type as Appointment["appointment_type"], companions: draft.companions, comment: draft.comment || null, product_name: null, status: "confirmed", created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      toast.success(result.success);
      onOpenChange(false);
    });
  }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>Ново записване</DialogTitle><DialogDescription>Часът ще бъде проверен по същите правила като публичното записване.</DialogDescription></DialogHeader>
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="manual-date" label="Дата *"><Input id="manual-date" type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} /></Field>
      <Field id="manual-time" label="Час *"><Input id="manual-time" type="time" value={draft.time} onChange={(event) => setDraft({ ...draft, time: event.target.value })} /></Field>
      <Field id="manual-name" label="Имена *"><Input id="manual-name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field>
      <Field id="manual-phone" label="Телефон *"><Input id="manual-phone" type="tel" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></Field>
      <Field id="manual-email" label="Имейл"><Input id="manual-email" type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></Field>
      <Field id="manual-type" label="Тип *"><NativeSelect id="manual-type" value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })}>{Object.entries(appointmentTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</NativeSelect></Field>
      <Field id="manual-companions" label="Придружители"><NativeSelect id="manual-companions" value={draft.companions} onChange={(event) => setDraft({ ...draft, companions: Number(event.target.value) })}>{Array.from({ length: maximumCompanions + 1 }, (_, value) => <option key={value}>{value}</option>)}</NativeSelect></Field>
      <div className="sm:col-span-2"><Field id="manual-comment" label="Коментар"><Textarea id="manual-comment" value={draft.comment} onChange={(event) => setDraft({ ...draft, comment: event.target.value })} /></Field></div>
    </div>
    <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отказ</Button><Button type="button" disabled={pending} onClick={submit}>{pending ? "Създаване…" : "Създай записване"}</Button></DialogFooter>
  </DialogContent></Dialog>;
}

function BlocksPanel({ blocks, setBlocks, pending, run }: { blocks: AppointmentBlock[]; setBlocks: React.Dispatch<React.SetStateAction<AppointmentBlock[]>>; pending: boolean; run: React.TransitionStartFunction }) {
  const [draft, setDraft] = useState({ kind: "date", date: "", start: "", end: "", reason: "" });
  function submit() {
    let start: Date;
    let end: Date;
    if (draft.kind === "date") {
      start = sofiaLocalToUtc(draft.date, "00:00");
      const nextDate = new Date(`${draft.date}T12:00:00Z`);
      nextDate.setUTCDate(nextDate.getUTCDate() + 1);
      end = sofiaLocalToUtc(nextDate.toISOString().slice(0, 10), "00:00");
    } else {
      start = sofiaLocalToUtc(draft.date, draft.start);
      end = sofiaLocalToUtc(draft.date, draft.end);
    }
    run(async () => {
      const result = await createAppointmentBlock({ startAt: start.toISOString(), endAt: end.toISOString(), reason: draft.reason });
      if (result.error) { toast.error(result.error); return; }
      setBlocks((current) => [...current, { id: crypto.randomUUID(), start_at: start.toISOString(), end_at: end.toISOString(), reason: draft.reason || null, created_at: new Date().toISOString() }]);
      toast.success(result.success);
    });
  }
  return <div className="grid gap-5 xl:grid-cols-[minmax(0,420px)_1fr]"><Card><CardHeader><CardTitle>Блокирай период</CardTitle></CardHeader><CardContent className="space-y-4">
    <Field id="block-kind" label="Вид"><NativeSelect id="block-kind" value={draft.kind} onChange={(event) => setDraft({ ...draft, kind: event.target.value })}><option value="date">Цял ден</option><option value="interval">Часови интервал</option></NativeSelect></Field>
    <Field id="block-date" label="Дата *"><Input id="block-date" type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} /></Field>
    {draft.kind === "interval" && <div className="grid grid-cols-2 gap-3"><Field id="block-start" label="От *"><Input id="block-start" type="time" value={draft.start} onChange={(event) => setDraft({ ...draft, start: event.target.value })} /></Field><Field id="block-end" label="До *"><Input id="block-end" type="time" value={draft.end} onChange={(event) => setDraft({ ...draft, end: event.target.value })} /></Field></div>}
    <Field id="block-reason" label="Причина"><Input id="block-reason" value={draft.reason} onChange={(event) => setDraft({ ...draft, reason: event.target.value })} placeholder="Празник, събитие…" /></Field>
    <Button type="button" disabled={pending || !draft.date} onClick={submit}><ShieldX />Блокирай</Button>
  </CardContent></Card><Card><CardHeader><CardTitle>Предстоящи блокировки</CardTitle></CardHeader><CardContent>{blocks.length ? <div className="divide-y">{blocks.map((block) => <div key={block.id} className="flex items-center gap-3 py-3"><Clock3 className="size-4 text-muted-foreground" /><div><p className="text-sm font-medium">{formatDateTime(block.start_at)} – {formatDateTime(block.end_at)}</p><p className="text-xs text-muted-foreground">{block.reason || "Без посочена причина"}</p></div></div>)}</div> : <p className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">Няма предстоящи блокировки.</p>}</CardContent></Card></div>;
}

function SettingsPanel({ settings, setSettings, pending, run }: { settings: AppointmentSettings; setSettings: React.Dispatch<React.SetStateAction<AppointmentSettings>>; pending: boolean; run: React.TransitionStartFunction }) {
  function setSchedule(day: string, index: 0 | 1, value: string) {
    const periods = settings.weekly_schedule[day] ?? [];
    const next = periods.length ? [...periods] as Array<[string,string]> : [["10:00", "19:00"]] as Array<[string,string]>;
    next[0] = [...next[0]] as [string,string];
    next[0][index] = value;
    setSettings({ ...settings, weekly_schedule: { ...settings.weekly_schedule, [day]: next } });
  }
  function toggleDay(day: string, open: boolean) {
    setSettings({ ...settings, weekly_schedule: { ...settings.weekly_schedule, [day]: open ? [["10:00", "19:00"]] : [] } });
  }
  function submit() {
    run(async () => {
      const result = await saveAppointmentSettings({ durationMinutes: settings.duration_minutes, bufferMinutes: settings.buffer_minutes, maximumCompanions: settings.maximum_companions, bookingWindowDays: settings.booking_window_days, minimumNoticeHours: settings.minimum_notice_hours, weeklySchedule: settings.weekly_schedule });
      if (result.error) { toast.error(result.error); return; }
      toast.success(result.success);
    });
  }
  return <div className="grid gap-5 xl:grid-cols-2"><Card><CardHeader><CardTitle>Правила за записване</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
    <NumberField id="duration" label="Продължителност (минути)" value={settings.duration_minutes} onChange={(value) => setSettings({ ...settings, duration_minutes: value })} />
    <NumberField id="buffer" label="Буфер (минути)" value={settings.buffer_minutes} onChange={(value) => setSettings({ ...settings, buffer_minutes: value })} />
    <NumberField id="companions" label="Максимум придружители" value={settings.maximum_companions} onChange={(value) => setSettings({ ...settings, maximum_companions: value })} />
    <NumberField id="window" label="Дни напред" value={settings.booking_window_days} onChange={(value) => setSettings({ ...settings, booking_window_days: value })} />
    <NumberField id="notice" label="Минимално предизвестие (часа)" value={settings.minimum_notice_hours} onChange={(value) => setSettings({ ...settings, minimum_notice_hours: value })} />
    <div className="sm:col-span-2"><Button type="button" disabled={pending} onClick={submit}>{pending ? "Запазване…" : "Запази настройките"}</Button></div>
  </CardContent></Card><Card><CardHeader><CardTitle>Седмичен график</CardTitle></CardHeader><CardContent className="space-y-3">{weekdays.map(([day, label]) => { const open = Boolean(settings.weekly_schedule[day]?.length); const period = settings.weekly_schedule[day]?.[0] ?? ["10:00", "19:00"]; return <div key={day} className="grid grid-cols-[120px_90px_1fr_1fr] items-center gap-2"><span className="text-sm">{label}</span><NativeSelect aria-label={`Статус за ${label}`} value={open ? "open" : "closed"} onChange={(event) => toggleDay(day, event.target.value === "open")}><option value="open">Отворено</option><option value="closed">Затворено</option></NativeSelect><Input aria-label={`Начало за ${label}`} type="time" disabled={!open} value={period[0]} onChange={(event) => setSchedule(day, 0, event.target.value)} /><Input aria-label={`Край за ${label}`} type="time" disabled={!open} value={period[1]} onChange={(event) => setSchedule(day, 1, event.target.value)} /></div>; })}</CardContent></Card></div>;
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) { return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}</div>; }
function NumberField({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (value: number) => void }) { return <Field id={id} label={label}><Input id={id} type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} /></Field>; }
function Detail({ label, children }: { label: string; children: React.ReactNode }) { return <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1">{children}</dd></div>; }
function formatDateTime(value: string) { return new Intl.DateTimeFormat("bg-BG", { timeZone: "Europe/Sofia", dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function duration(appointment: Appointment) { return Math.round((new Date(appointment.end_at).getTime() - new Date(appointment.start_at).getTime()) / 60000); }
