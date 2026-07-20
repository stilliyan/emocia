"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock, ImageIcon, Pencil, Phone, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ThemeSwitch } from "@/components/theme-switch";
import { changeCalendarEventStatus, deleteCalendarEvent, getCalendarEvents, saveCalendarEvent } from "@/app/actions";
import { cancelAppointmentRequest, confirmAppointmentRequest } from "@/app/actions/appointments";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { calendarRange, dateKey, monthGrid, weekRange } from "@/lib/calendar";
import type { AppointmentRequest, CalendarEvent, Product, ProductImage } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";

const statusLabels = { upcoming: "Предстоящо", completed: "Завършено", cancelled: "Отказано" };
const productStatusLabels = { draft: "Чернова", published: "Публикуван", archived: "Архивиран" };
const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

type Draft = { id?: string; title: string; description: string; status: CalendarEvent["status"]; date: string; startTime: string; endTime: string; allDay: boolean; color: string };

function blankDraft(date: string): Draft { return { title: "", description: "", status: "upcoming", date, startTime: "10:00", endTime: "", allDay: false, color: "" }; }
function toLocalTime(iso: string) { return new Intl.DateTimeFormat("bg-BG", { timeZone: "Europe/Sofia", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso)); }
function toDraft(event: CalendarEvent): Draft { return { id: event.id, title: event.title, description: event.description ?? "", status: event.status, date: dateKey(event.start_at), startTime: event.all_day ? "10:00" : toLocalTime(event.start_at), endTime: event.end_at ? toLocalTime(event.end_at) : "", allDay: event.all_day, color: event.color ?? "" }; }

function preferredImage(images?: ProductImage[]) { return images?.find((image) => image.is_cover) ?? images?.slice().sort((a, b) => a.sort_order - b.sort_order)[0]; }
function imageUrl(product: Product) { const image = preferredImage(product.product_images); return image ? createClient().storage.from("product-images").getPublicUrl(image.storage_path).data.publicUrl : null; }

function attentionIssues(product: Product) {
  const images = product.product_images ?? [];
  const issues: string[] = [];
  if (product.status === "draft") issues.push("Чернова");
  if (!product.categories) issues.push("Липсва категория");
  if (!images.some((image) => image.is_cover)) issues.push("Липсва основна снимка");
  if (images.length < 2) issues.push("Недостатъчно снимки");
  if (!product.seo_title) issues.push("Липсва SEO заглавие");
  if (!product.meta_description) issues.push("Липсва meta описание");
  if (images.some((image) => !image.alt_text?.trim())) issues.push("Снимка без alt текст");
  return issues;
}

type DashboardProps = { products: Product[]; initialEvents: CalendarEvent[]; initialRequests: AppointmentRequest[]; initialCalendarError?: string; initialAppointmentError?: string };

export function Dashboard({ products, initialEvents, initialRequests, initialCalendarError = "", initialAppointmentError = "" }: DashboardProps) {
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(dateKey(today));
  const [events, setEvents] = useState(initialEvents);
  const [draft, setDraft] = useState<Draft>(blankDraft(selectedDate));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [calendarError, setCalendarError] = useState(initialCalendarError);
  const [requests, setRequests] = useState(initialRequests);
  const [appointmentError, setAppointmentError] = useState(initialAppointmentError);
  const [showAllAgenda, setShowAllAgenda] = useState(false);
  const [calendarPending, startCalendarTransition] = useTransition();
  const [mutationPending, startMutationTransition] = useTransition();
  const [appointmentPending, startAppointmentTransition] = useTransition();
  const days = useMemo(() => monthGrid(month), [month]);
  const groupedEvents = useMemo(() => events.reduce((groups, event) => {
    const key = dateKey(event.start_at);
    groups.set(key, [...(groups.get(key) ?? []), event]);
    return groups;
  }, new Map<string, CalendarEvent[]>()), [events]);
  const agenda = (groupedEvents.get(selectedDate) ?? []).slice().sort((a, b) => a.start_at.localeCompare(b.start_at));
  const attention = products.map((product) => ({ product, issues: attentionIssues(product) })).filter((item) => item.issues.length);
  const currentWeek = weekRange(today);
  const eventsThisWeek = initialEvents.filter((event) => { const start = new Date(event.start_at); return start >= currentWeek.start && start < currentWeek.end && event.status !== "cancelled"; }).length;

  function openNew(date = selectedDate) { setDraft(blankDraft(date)); setFormError(""); setDialogOpen(true); }
  function openEdit(event: CalendarEvent) { setDraft(toDraft(event)); setFormError(""); setDialogOpen(true); }

  function loadMonth(next: Date) {
    setMonth(next);
    startCalendarTransition(async () => {
      const result = await getCalendarEvents(calendarRange(next));
      if (result.error) { setCalendarError(result.error); toast.error(result.error); } else { setCalendarError(""); setEvents(result.data ?? []); }
    });
  }

  async function refreshEvents() {
    const result = await getCalendarEvents(calendarRange(month));
    if (result.error) { setCalendarError(result.error); toast.error(result.error); } else { setCalendarError(""); setEvents(result.data ?? []); }
  }

  function submitEvent() {
    if (mutationPending) return;
    setFormError("");
    startMutationTransition(async () => {
      const start = new Date(`${draft.date}T${draft.allDay ? "00:00" : draft.startTime}:00`).toISOString();
      const end = draft.allDay || !draft.endTime ? null : new Date(`${draft.date}T${draft.endTime}:00`).toISOString();
      const result = await saveCalendarEvent({ id: draft.id, title: draft.title, description: draft.description, status: draft.status, startsAt: start, endsAt: end, allDay: draft.allDay, color: draft.color });
      if (result.error) { setFormError(result.error); return; }
      toast.success(result.success);
      setDialogOpen(false);
      await refreshEvents();
    });
  }

  function changeStatus(id: string, status: CalendarEvent["status"]) {
    startMutationTransition(async () => { const result = await changeCalendarEventStatus(id, status); if (result.error) toast.error(result.error); else { toast.success(result.success); setDialogOpen(false); await refreshEvents(); } });
  }

  function removeEvent(id: string) {
    startMutationTransition(async () => { const result = await deleteCalendarEvent(id); if (result.error) toast.error(result.error); else { toast.success(result.success); setDialogOpen(false); await refreshEvents(); } });
  }

  function confirmRequest(id: string) {
    if (appointmentPending) return;
    setAppointmentError("");
    startAppointmentTransition(async () => {
      const result = await confirmAppointmentRequest(id);
      if (result.error) { setAppointmentError(result.error); toast.error(result.error); return; }
      setRequests((current) => current.filter((request) => request.id !== id));
      toast.success(result.success);
      await refreshEvents();
    });
  }

  function cancelRequest(id: string) {
    if (appointmentPending) return;
    setAppointmentError("");
    startAppointmentTransition(async () => {
      const result = await cancelAppointmentRequest(id);
      if (result.error) { setAppointmentError(result.error); toast.error(result.error); return; }
      setRequests((current) => current.filter((request) => request.id !== id));
      toast.success(result.success);
    });
  }

  return <div className="space-y-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div><h1 className="text-2xl font-semibold tracking-tight">Табло</h1><p className="mt-1 text-sm text-muted-foreground">Преглед на каталога, срещите и задачите.</p></div>
      <div className="flex flex-wrap items-center gap-2"><Button type="button" variant="outline" onClick={() => openNew()}><CalendarDays />Ново събитие</Button><Button asChild><Link href="/admin/products/new"><Plus />Добави продукт</Link></Button><div className="hidden md:block"><ThemeSwitch/></div></div>
    </div>

    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <StatLink href="/admin/products?status=published" label="Публикувани продукти" value={products.filter((product) => product.status === "published").length} />
      <StatLink href="/admin/products?status=draft" label="Чернови" value={products.filter((product) => product.status === "draft").length} />
      <StatLink href="#attention" label="Изискват внимание" value={attention.length} />
      <button type="button" onClick={() => loadMonth(new Date(today.getFullYear(), today.getMonth(), 1))} className="rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10"><Stat label="Събития тази седмица" value={eventsThisWeek} /></button>
    </div>

    <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
      <Card className="min-w-0"><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle className="capitalize">{new Intl.DateTimeFormat("bg-BG", { month: "long", year: "numeric" }).format(month)}</CardTitle><div className="flex items-center gap-1"><Button type="button" size="icon-sm" variant="outline" aria-label="Предишен месец" onClick={() => loadMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft /></Button><Button type="button" size="sm" variant="outline" onClick={() => { const now = new Date(); setSelectedDate(dateKey(now)); loadMonth(new Date(now.getFullYear(), now.getMonth(), 1)); }}>Днес</Button><Button type="button" size="icon-sm" variant="outline" aria-label="Следващ месец" onClick={() => loadMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight /></Button></div></div></CardHeader><CardContent>
        {calendarPending && <p role="status" className="mb-3 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">Зареждане на събитията…</p>}
        {calendarError && <p role="alert" className="mb-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{calendarError}</p>}
        {!calendarPending && !calendarError && events.length === 0 && <p className="mb-3 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">Няма събития за този месец.</p>}
        <div className="grid grid-cols-7 border-l border-t text-center text-xs font-medium text-muted-foreground">{weekdays.map((day) => <div key={day} className="border-b border-r py-2">{day}</div>)}</div>
        <div className={`grid grid-cols-7 border-l ${calendarPending ? "opacity-60" : ""}`}>{days.map((day) => { const key = dateKey(day); const dayEvents = groupedEvents.get(key) ?? []; const outside = day.getMonth() !== month.getMonth(); const selected = key === selectedDate; const isToday = key === dateKey(today); return <button key={key} type="button" aria-label={new Intl.DateTimeFormat("bg-BG", { dateStyle: "full" }).format(day)} aria-pressed={selected} onClick={() => { setSelectedDate(key); setShowAllAgenda(false); }} className={`min-h-16 min-w-0 border-b border-r p-1.5 text-left align-top outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black/20 sm:min-h-20 ${outside ? "bg-muted/25 text-muted-foreground" : "bg-background"} ${selected ? "bg-muted ring-1 ring-inset ring-foreground/25" : ""}`}><span className={`grid size-7 place-items-center rounded-full text-xs ${isToday ? "bg-primary text-primary-foreground" : ""}`}>{day.getDate()}</span><span className="mt-1 block space-y-1 overflow-hidden">{dayEvents.slice(0, 2).map((event) => <span key={event.id} className="block truncate rounded bg-muted px-1 py-0.5 text-[10px] text-foreground"><span className="mr-1">•</span>{event.title}</span>)}{dayEvents.length > 2 && <span className="block text-[10px] text-muted-foreground">+ още {dayEvents.length - 2}</span>}</span></button>; })}</div>
      </CardContent></Card>

      <Card><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle>Днес</CardTitle><p className="mt-1 text-xs text-muted-foreground">{new Intl.DateTimeFormat("bg-BG", { dateStyle: "long" }).format(new Date(`${selectedDate}T12:00:00`))}</p></div><Button type="button" size="sm" variant="outline" onClick={() => openNew(selectedDate)}><Plus />Ново</Button></div></CardHeader><CardContent>
        {agenda.length ? <div className="divide-y">{agenda.slice(0, showAllAgenda ? agenda.length : 7).map((event) => <div key={event.id} className="py-3"><div className="flex items-start justify-between gap-2"><button type="button" className="min-w-0 text-left" onClick={() => openEdit(event)}><span className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="size-3" />{event.all_day ? "Цял ден" : toLocalTime(event.start_at)}</span><span className="mt-1 block truncate text-sm font-medium">{event.title}</span>{event.description && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{event.description}</span>}</button><Badge variant={event.status === "completed" ? "secondary" : event.status === "cancelled" ? "destructive" : "outline"}>{statusLabels[event.status]}</Badge></div>{event.status === "upcoming" && <Button type="button" size="sm" variant="ghost" className="mt-1" disabled={mutationPending} onClick={() => changeStatus(event.id, "completed")}><Check />Завършено</Button>}</div>)}{agenda.length > 7 && !showAllAgenda && <Button type="button" variant="ghost" className="mt-2 w-full" onClick={() => setShowAllAgenda(true)}>Виж всички</Button>}</div> : <div className="rounded-lg bg-muted/40 p-4 text-center text-sm text-muted-foreground">Няма планирани събития за този ден.</div>}
      </CardContent></Card>
    </div>

    <Card>
      <CardHeader><div className="flex items-center justify-between gap-3"><div><CardTitle>Заявки за проба</CardTitle><p className="mt-1 text-sm text-muted-foreground">Потвърдените заявки се добавят автоматично в календара.</p></div><Badge variant={requests.length ? "default" : "secondary"}>{requests.length}</Badge></div></CardHeader>
      <CardContent>
        {appointmentError && <p role="alert" className="mb-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{appointmentError}</p>}
        {!appointmentError && requests.length === 0 && <p className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">Няма чакащи заявки за проба.</p>}
        {requests.length > 0 && <div className="divide-y">{requests.map((request) => <AppointmentRequestRow key={request.id} request={request} pending={appointmentPending} onConfirm={confirmRequest} onCancel={cancelRequest} />)}</div>}
      </CardContent>
    </Card>

    <div className="grid gap-5 xl:grid-cols-2">
      <Card id="attention"><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>Изискват внимание</CardTitle><Button asChild variant="ghost" size="sm"><Link href="/admin/products">Виж всички</Link></Button></div></CardHeader><CardContent>{attention.length ? <div className="divide-y">{attention.slice(0, 5).map(({ product, issues }) => <ProductAttentionRow key={product.id} product={product} issues={issues} />)}</div> : <p className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">Каталогът е в добро състояние — няма продукти, които изискват внимание.</p>}</CardContent></Card>
      <Card><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>Последно обновени</CardTitle><Button asChild variant="ghost" size="sm"><Link href="/admin/products">Виж всички продукти</Link></Button></div></CardHeader><CardContent>{products.length ? <div className="divide-y">{products.slice(0, 5).map((product) => <RecentProductRow key={product.id} product={product} />)}</div> : <p className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">Все още няма продукти.</p>}</CardContent></Card>
    </div>

    <EventDialog open={dialogOpen} onOpenChange={setDialogOpen} draft={draft} setDraft={setDraft} pending={mutationPending} error={formError} onSubmit={submitEvent} onStatus={changeStatus} onDelete={removeEvent} />
  </div>;
}

function StatLink({ href, label, value }: { href: string; label: string; value: number }) { return <Link href={href} className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10"><Stat label={label} value={value} /></Link>; }
function Stat({ label, value }: { label: string; value: number }) { return <Card className="h-full transition-colors hover:bg-muted/30" size="sm"><CardContent><p className="text-xs text-muted-foreground sm:text-sm">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p></CardContent></Card>; }

function ProductThumb({ product }: { product: Product }) {
  const url = imageUrl(product);
  if (!url) return <span className="grid size-10 place-items-center rounded-lg bg-muted"><ImageIcon className="size-4 text-muted-foreground" /></span>;
  // Supabase project host is dynamic, so a static Next Image host cannot be configured here.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={preferredImage(product.product_images)?.alt_text || product.name} className="size-10 rounded-lg object-cover" />;
}
function ProductAttentionRow({ product, issues }: { product: Product; issues: string[] }) { return <div className="flex items-center gap-3 py-3"><ProductThumb product={product} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{product.name}</p><p className="truncate text-xs text-muted-foreground">{issues.join(" · ")}</p></div><Badge variant="secondary">{productStatusLabels[product.status]}</Badge><Button asChild size="icon-sm" variant="ghost"><Link href={`/admin/products/${product.id}`} aria-label={`Редактирай ${product.name}`}><Pencil /></Link></Button></div>; }
function RecentProductRow({ product }: { product: Product }) { return <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 py-3"><ProductThumb product={product} /><div className="min-w-0"><p className="truncate text-sm font-medium">{product.name}</p><p className="text-xs text-muted-foreground">{new Intl.DateTimeFormat("bg-BG").format(new Date(product.updated_at))}</p></div><Badge variant={product.status === "published" ? "default" : "secondary"}>{productStatusLabels[product.status]}</Badge><Button asChild size="icon-sm" variant="ghost"><Link href={`/admin/products/${product.id}`} aria-label={`Редактирай ${product.name}`}><Pencil /></Link></Button></div>; }

function AppointmentRequestRow({ request, pending, onConfirm, onCancel }: { request: AppointmentRequest; pending: boolean; onConfirm: (id: string) => void; onCancel: (id: string) => void }) {
  const date = new Intl.DateTimeFormat("bg-BG", { dateStyle: "medium" }).format(new Date(`${request.preferred_date}T12:00:00`));
  return <div className="grid gap-3 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><p className="font-medium">{request.name}</p><span className="text-sm text-muted-foreground">{date} · {request.preferred_time.slice(0, 5)}</span>{request.product_name && <Badge variant="outline">{request.product_name}</Badge>}</div><a href={`tel:${request.phone.replace(/\s/g, "")}`} className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><Phone className="size-3.5" />{request.phone}</a>{request.message && <p className="mt-1 text-sm text-muted-foreground">{request.message}</p>}</div><div className="flex flex-wrap gap-2"><Button type="button" size="sm" disabled={pending} onClick={() => onConfirm(request.id)}><Check />Потвърди</Button><Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => onCancel(request.id)}><X />Откажи</Button></div></div>;
}

function EventDialog({ open, onOpenChange, draft, setDraft, pending, error, onSubmit, onStatus, onDelete }: { open: boolean; onOpenChange: (open: boolean) => void; draft: Draft; setDraft: (draft: Draft) => void; pending: boolean; error: string; onSubmit: () => void; onStatus: (id: string, status: CalendarEvent["status"]) => void; onDelete: (id: string) => void }) {
  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft({ ...draft, [key]: value });
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{draft.id ? "Редактиране на събитие" : "Ново събитие"}</DialogTitle><DialogDescription>Добавете събитие в календара на CMS.</DialogDescription></DialogHeader><form noValidate onSubmit={(event) => { event.preventDefault(); onSubmit(); }} className="grid gap-4 md:grid-cols-2">
    <div className="md:col-span-2"><Field id="event-title" label="Заглавие *"><Input id="event-title" value={draft.title} onChange={(event) => update("title", event.target.value)} required /></Field></div>
    <Field id="event-status" label="Статус"><NativeSelect id="event-status" value={draft.status} onChange={(event) => update("status", event.target.value as Draft["status"])}>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</NativeSelect></Field>
    <Field id="event-date" label="Дата *"><Input id="event-date" type="date" value={draft.date} onChange={(event) => update("date", event.target.value)} required /></Field>
    <label className="flex min-h-10 items-center gap-3 text-sm md:col-span-2"><Checkbox checked={draft.allDay} onCheckedChange={(checked) => update("allDay", checked === true)} />Целодневно събитие</label>
    {!draft.allDay && <><Field id="event-start" label="Начален час *"><Input id="event-start" type="time" value={draft.startTime} onChange={(event) => update("startTime", event.target.value)} required /></Field><Field id="event-end" label="Краен час"><Input id="event-end" type="time" value={draft.endTime} onChange={(event) => update("endTime", event.target.value)} /></Field></>}
    <div className="md:col-span-2"><Field id="event-color" label="Цвят (по избор)"><Input id="event-color" value={draft.color} onChange={(event) => update("color", event.target.value)} placeholder="#2563eb" /></Field></div>
    <div className="md:col-span-2"><Field id="event-description" label="Описание"><Textarea id="event-description" value={draft.description} onChange={(event) => update("description", event.target.value)} rows={4} /></Field></div>
    {error && <p role="alert" className="text-sm text-destructive md:col-span-2">{error}</p>}
    <DialogFooter className="md:col-span-2"><div className="flex flex-1 flex-wrap gap-2">{draft.id && draft.status === "upcoming" && <><Button type="button" variant="outline" disabled={pending} onClick={() => onStatus(draft.id!, "completed")}><Check />Завърши</Button><Button type="button" variant="ghost" disabled={pending} onClick={() => onStatus(draft.id!, "cancelled")}>Откажи събитието</Button></>}{draft.id && <AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="destructive" disabled={pending}><Trash2 />Изтрий</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Изтриване на събитие</AlertDialogTitle><AlertDialogDescription>Сигурни ли сте, че искате да изтриете това събитие? Действието не може да бъде отменено.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel type="button">Отказ</AlertDialogCancel><AlertDialogAction type="button" variant="destructive" onClick={() => onDelete(draft.id!)}>Изтрий събитие</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>}</div><Button type="submit" disabled={pending}>{pending ? "Запазване…" : "Запази събитието"}</Button></DialogFooter>
  </form></DialogContent></Dialog>;
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) { return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}</div>; }
