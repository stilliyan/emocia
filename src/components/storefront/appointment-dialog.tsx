"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState, useTransition } from "react";
import { CalendarCheck, CalendarPlus, ChevronDown, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { bookAppointment, getBookingAvailability, submitAppointmentRequest, type AppointmentRequestState, type BookingActionState } from "@/app/actions/appointments";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { appointmentTypeLabels, bulgarianDate, getCalendarCells, type BookingAvailability } from "@/lib/appointment-booking";
import { cn } from "@/lib/utils";

export type AppointmentSource = "home" | "contact" | "product" | "blog" | "gallery" | "collection" | "accessories" | "about" | "other";

type AppointmentContext = {
  source: AppointmentSource;
  productName?: string;
  productId?: string;
};

type DialogProps = AppointmentContext & {
  children?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type AppointmentFormProps = AppointmentContext & {
  onSuccess?: (state: AppointmentRequestState) => void;
  className?: string;
  submitLabel?: string;
  variant?: "default" | "compact-contact" | "simple-contact";
};

type RequiredFieldErrors = { name?: string; phone?: string; privacyConsent?: string };

function requiredFieldError(field: "name" | "phone", value: string) {
  const trimmed = value.trim();
  if (field === "name") return trimmed.length < 2 ? "Моля, въведете вашето име." : undefined;
  return trimmed.length < 7 ? "Моля, въведете валиден телефонен номер." : undefined;
}

function dateValue(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function AppointmentRequestForm({ source, productName, productId, onSuccess, className, submitLabel = "Изпрати заявка", variant = "default" }: AppointmentFormProps) {
  const id = useId();
  const [result, setResult] = useState<AppointmentRequestState>({});
  const [fieldErrors, setFieldErrors] = useState<RequiredFieldErrors>({});
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [showDetails, setShowDetails] = useState(Boolean(productName));
  const [pending, startTransition] = useTransition();
  const limits = useMemo(() => ({ min: dateValue(), max: dateValue(180) }), []);
  const compact = variant === "compact-contact";
  const simpleContact = variant === "simple-contact";

  function requiredFieldErrors(form: FormData): RequiredFieldErrors {
    return {
      name: requiredFieldError("name", String(form.get("name") ?? "")),
      phone: requiredFieldError("phone", String(form.get("phone") ?? "")),
      privacyConsent: form.get("privacy_consent") === "true"
        ? undefined
        : "Необходимо е съгласие с политиката за поверителност.",
    };
  }

  function validateField(field: "name" | "phone", value: string) {
    setFieldErrors((current) => ({ ...current, [field]: requiredFieldError(field, value) }));
  }

  function validationIsActive(field: keyof RequiredFieldErrors) {
    return Object.prototype.hasOwnProperty.call(fieldErrors, field);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    const nextFieldErrors = requiredFieldErrors(form);
    setFieldErrors(nextFieldErrors);
    const firstInvalidField = (Object.keys(nextFieldErrors) as Array<keyof RequiredFieldErrors>).find((field) => nextFieldErrors[field]);
    if (firstInvalidField) {
      const field = firstInvalidField === "privacyConsent"
        ? document.getElementById(`${id}-privacy-consent`)
        : event.currentTarget.elements.namedItem(firstInvalidField);
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    form.set("current_url", `${window.location.pathname}${window.location.search}`);
    setResult({});
    startTransition(async () => {
      const next = await submitAppointmentRequest(form);
      setResult(next);
      if (next.success) onSuccess?.(next);
    });
  }

  return (
    <form onSubmit={submit} className={cn("grid gap-4", compact && "storefront-contact-form--compact", simpleContact && "storefront-contact-form--simple", className)} noValidate aria-busy={pending}>
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="product_id" value={productId ?? ""} />
      <input type="hidden" name="current_url" value="" />
      <input type="hidden" name="privacy_consent" value={privacyConsent ? "true" : "false"} />
      <div hidden aria-hidden="true">
        <label htmlFor={`${id}-website`}>Уебсайт</label>
        <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className={cn("grid gap-4 sm:grid-cols-2", compact && "storefront-contact-form__primary-fields")}>
        <div className="space-y-2">
          <Label htmlFor={`${id}-name`}>Име {simpleContact ? <span className="storefront-contact-form__required" aria-hidden="true">*</span> : "*"}</Label>
          <Input id={`${id}-name`} name="name" autoComplete="name" placeholder="Вашето име" required aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? `${id}-name-error` : undefined} onBlur={(event) => validationIsActive("name") && validateField("name", event.currentTarget.value)} onChange={(event) => validationIsActive("name") && validateField("name", event.currentTarget.value)} />
          {fieldErrors.name && <p id={`${id}-name-error`} role="alert" className="storefront-contact-form__field-error">{fieldErrors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-phone`}>Телефон {simpleContact ? <span className="storefront-contact-form__required" aria-hidden="true">*</span> : "*"}</Label>
          <Input id={`${id}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="Телефонен номер" required aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? `${id}-phone-error` : undefined} onBlur={(event) => validationIsActive("phone") && validateField("phone", event.currentTarget.value)} onChange={(event) => validationIsActive("phone") && validateField("phone", event.currentTarget.value)} />
          {fieldErrors.phone && <p id={`${id}-phone-error`} role="alert" className="storefront-contact-form__field-error">{fieldErrors.phone}</p>}
        </div>
        {!simpleContact && <div className="space-y-2">
          <Label htmlFor={`${id}-date`}>Предпочитана дата {compact ? <span>(по желание)</span> : "*"}</Label>
          <Input id={`${id}-date`} name="preferred_date" type="date" min={limits.min} max={limits.max} required={!compact} />
        </div>}
        {!compact && !simpleContact && <div className="space-y-2"><Label htmlFor={`${id}-time`}>Предпочитан час *</Label><Input id={`${id}-time`} name="preferred_time" type="time" min="10:00" max="18:00" step="1800" required /></div>}
      </div>
      {compact && <button type="button" className="storefront-contact-form__details-toggle" aria-expanded={showDetails} aria-controls={`${id}-details`} onClick={() => setShowDetails((open) => !open)}>Имате избран модел или уточнение?<ChevronDown aria-hidden="true" /></button>}
      <div id={`${id}-details`} hidden={compact && !showDetails} className={cn("grid gap-4", compact && "storefront-contact-form__details")}>
        {!simpleContact && <div className="space-y-2">
          <Label htmlFor={`${id}-product`}>Модел <span className="font-normal text-muted-foreground">(по желание)</span></Label>
          <Input id={`${id}-product`} name="product_name" defaultValue={productName ?? ""} readOnly={Boolean(productName)} placeholder="Име на рокля или артикул" />
        </div>}
        <div className="space-y-2"><Label htmlFor={`${id}-message`}>Съобщение{!simpleContact && <span className="font-normal text-muted-foreground"> (по желание)</span>}</Label><Textarea id={`${id}-message`} name="message" rows={compact ? 2 : 3} placeholder={simpleContact ? "Напишете съобщението си…" : "Размер или друго уточнение…"} /></div>
      </div>
      {!compact && !simpleContact && <p className="text-xs leading-relaxed text-muted-foreground">Заявката не е автоматично потвърждение. Екипът ни ще ви потърси по телефона.</p>}
      <div className="storefront-contact-form__consent-wrap">
        <label className="storefront-contact-form__consent" htmlFor={`${id}-privacy-consent`}>
          <Checkbox
            id={`${id}-privacy-consent`}
            checked={privacyConsent}
            onCheckedChange={(checked) => {
              const next = checked === true;
              setPrivacyConsent(next);
              if (Object.prototype.hasOwnProperty.call(fieldErrors, "privacyConsent")) {
                setFieldErrors((current) => ({
                  ...current,
                  privacyConsent: next ? undefined : "Необходимо е съгласие с политиката за поверителност.",
                }));
              }
            }}
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.privacyConsent)}
            aria-describedby={fieldErrors.privacyConsent ? `${id}-privacy-consent-error` : undefined}
          />
          <span>
            {simpleContact
              ? "Съгласна съм личните ми данни да бъдат използвани, за да получа отговор на запитването. "
              : "Съгласна съм личните ми данни да бъдат използвани за това записване. "}
            <Link href="/politika-za-poveritelnost" target="_blank" rel="noreferrer">Политика за поверителност</Link>.
          </span>
        </label>
        {fieldErrors.privacyConsent && <p id={`${id}-privacy-consent-error`} role="alert" className="storefront-contact-form__field-error">{fieldErrors.privacyConsent}</p>}
      </div>
      {result.error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{result.error}</p>}
      {result.success && <p role="status" className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-800">{result.success}</p>}
      <Button type="submit" className="storefront-button storefront-button--dark" disabled={pending}>{pending ? "Изпращане…" : submitLabel}</Button>
      {compact ? <div className="storefront-contact-form__footer"><p>Ще се свържем с вас по телефона за потвърждение.</p><Link href="/politika-za-poveritelnost">Политика за поверителност</Link></div> : !simpleContact && <p className="mx-auto max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">С изпращането на заявката се съгласявате данните ви да бъдат използвани за връзка относно пробата. <Link href="/politika-za-poveritelnost" className="underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Политика за поверителност</Link></p>}
    </form>
  );
}

export function AppointmentDialog({ children, className, productName, productId, source, ariaLabel, open: controlledOpen, onOpenChange }: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;

  function handleOpenChange(next: boolean) {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild><button type="button" className={className} aria-label={ariaLabel}>{children}</button></DialogTrigger>}
      <DialogContent className="storefront-public-dialog storefront-booking-dialog" aria-describedby="booking-dialog-description">
        <BookingFlow source={source} productName={productName} productId={productId} onClose={() => handleOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

type BookingDraft = {
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  appointmentType: keyof typeof appointmentTypeLabels | "";
  companions: number;
  comment: string;
  privacyConsent: boolean;
  website: string;
};

const emptyDraft: BookingDraft = {
  date: "", time: "", name: "", phone: "", email: "", appointmentType: "",
  companions: 0, comment: "", privacyConsent: false, website: "",
};

type BookingFieldName = "name" | "phone" | "email" | "appointmentType" | "privacyConsent";
type BookingFieldErrors = Partial<Record<BookingFieldName, string>>;

function currentSofiaDate() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Sofia", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function calendarTimestamp(date: string, time: string, offsetMinutes = 0) {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day, hours, minutes + offsetMinutes));
  return [
    value.getUTCFullYear(),
    String(value.getUTCMonth() + 1).padStart(2, "0"),
    String(value.getUTCDate()).padStart(2, "0"),
    "T",
    String(value.getUTCHours()).padStart(2, "0"),
    String(value.getUTCMinutes()).padStart(2, "0"),
    "00",
  ].join("");
}

function escapeCalendarText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("\n", "\\n").replaceAll(",", "\\,").replaceAll(";", "\\;");
}

function BookingFlow({ source, productName, productId, onClose }: AppointmentContext & { onClose: () => void }) {
  const [month, setMonth] = useState(() => {
    const [year, monthNumber] = currentSofiaDate().split("-").map(Number);
    return { year, index: monthNumber - 1 };
  });
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<BookingDraft>(emptyDraft);
  const [availability, setAvailability] = useState<BookingAvailability | null>(null);
  const [loadingAvailability, startAvailabilityTransition] = useTransition();
  const [submitting, startSubmitTransition] = useTransition();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<BookingFieldErrors>({});
  const [result, setResult] = useState<BookingActionState | null>(null);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const days = useMemo(() => getCalendarCells(month.year, month.index), [month]);
  const selectedDay = availability?.days.find((day) => day.date === draft.date);
  const selectedSlot = selectedDay?.slots.find((slot) => slot.label === draft.time);
  const today = currentSofiaDate();

  useEffect(() => {
    let active = true;
    startAvailabilityTransition(async () => {
      const next = await getBookingAvailability({ year: month.year, monthIndex: month.index });
      if (!active) return;
      if (next.error) {
        setAvailability(null);
        setError(next.error);
      } else {
        setAvailability(next.data ?? null);
        if (draft.date && !next.data?.days.some((day) => day.date === draft.date && day.availableCount > 0)) {
          setDraft((current) => ({ ...current, date: "", time: "" }));
        }
      }
    });
    return () => { active = false; };
  // A month change is the only trigger. A selected date is intentionally preserved when valid.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month.year, month.index]);

  function changeMonth(offset: number) {
    const next = new Date(Date.UTC(month.year, month.index + offset, 1));
    setError("");
    setMonth({ year: next.getUTCFullYear(), index: next.getUTCMonth() });
  }

  function update<K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    if (key in fieldErrors) {
      setFieldErrors((current) => {
        const next = { ...current };
        delete next[key as BookingFieldName];
        return next;
      });
    }
    setError("");
  }

  function validatePersonalInfo() {
    const nextErrors: BookingFieldErrors = {};
    if (draft.name.trim().length < 2) nextErrors.name = "Въведете вашите имена.";
    if (draft.phone.trim().length < 7) nextErrors.phone = "Въведете валиден телефонен номер.";
    if (draft.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(draft.email)) nextErrors.email = "Въведете валиден имейл.";
    if (!draft.appointmentType) nextErrors.appointmentType = "Изберете тип на пробата.";
    if (!draft.privacyConsent) nextErrors.privacyConsent = "Необходимо е съгласие с политиката за поверителност.";
    setFieldErrors(nextErrors);
    const firstInvalid = Object.keys(nextErrors)[0] as BookingFieldName | undefined;
    if (firstInvalid) {
      requestAnimationFrame(() => document.getElementById(`booking-${firstInvalid}`)?.focus());
      return false;
    }
    return true;
  }

  function submit() {
    if (!validatePersonalInfo() || !selectedSlot || submitting || !idempotencyKey || !draft.appointmentType) return;
    setError("");
    startSubmitTransition(async () => {
      const next = await bookAppointment({
        localDate: draft.date,
        localTime: draft.time,
        name: draft.name,
        phone: draft.phone,
        email: draft.email,
        appointmentType: draft.appointmentType,
        companions: draft.companions,
        comment: draft.comment,
        privacyConsent: draft.privacyConsent,
        idempotencyKey,
        productId: productId ?? "",
        productName: productName ?? "",
        source,
        currentUrl: `${window.location.pathname}${window.location.search}`,
        website: draft.website,
      });
      if (next.error) {
        setError(next.error);
        if (next.slotUnavailable) {
          update("time", "");
          const refreshed = await getBookingAvailability({ year: month.year, monthIndex: month.index });
          if (refreshed.data) setAvailability(refreshed.data);
          setStep(1);
        }
        return;
      }
      setResult(next);
      setStep(3);
    });
  }

  function handleCalendarKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, date: string) {
    const dayOffset = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" ? -7 : event.key === "ArrowDown" ? 7 : 0;
    if (!dayOffset) return;
    event.preventDefault();
    const nextDate = new Date(`${date}T12:00:00Z`);
    nextDate.setUTCDate(nextDate.getUTCDate() + dayOffset);
    const nextValue = nextDate.toISOString().slice(0, 10);
    const nextButton = event.currentTarget.closest('[role="grid"]')?.querySelector<HTMLButtonElement>(`button[data-date="${nextValue}"]:not(:disabled)`);
    nextButton?.focus();
  }

  const monthLabel = new Intl.DateTimeFormat("bg-BG", { month: "long", year: "numeric", timeZone: "Europe/Sofia" }).format(new Date(Date.UTC(month.year, month.index, 12)));
  const firstAllowedMonth = `${month.year}-${String(month.index + 1).padStart(2, "0")}` <= today.slice(0, 7);
  const durationMinutes = availability?.durationMinutes ?? 60;
  const boutiqueAddress = availability?.address || "гр. Варна, бул. Вл. Варненчик 69";

  function downloadCalendarEvent() {
    if (!draft.date || !draft.time) return;
    const appointmentLabel = draft.appointmentType ? appointmentTypeLabels[draft.appointmentType] : "Лична проба";
    const calendar = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Бутик Емоция//Записване за проба//BG",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-TIMEZONE:Europe/Sofia",
      "BEGIN:VEVENT",
      `UID:${idempotencyKey}@butik-emocia.bg`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`,
      `DTSTART;TZID=Europe/Sofia:${calendarTimestamp(draft.date, draft.time)}`,
      `DTEND;TZID=Europe/Sofia:${calendarTimestamp(draft.date, draft.time, durationMinutes)}`,
      `SUMMARY:${escapeCalendarText("Проба в Бутик Емоция")}`,
      `DESCRIPTION:${escapeCalendarText(`${appointmentLabel}${productName ? ` — ${productName}` : ""}`)}`,
      `LOCATION:${escapeCalendarText(boutiqueAddress)}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([calendar], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "butik-emocia-proba.ics";
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="storefront-booking" data-step={step} aria-busy={loadingAvailability || submitting}>
      {step < 3 && <DialogHeader className="storefront-booking__header">
        <p className="storefront-booking__step" aria-live="polite">Стъпка {step} от 2</p>
        <DialogTitle>{step === 1 ? "Изберете дата и час" : "Вашите данни"}</DialogTitle>
        <DialogDescription id="booking-dialog-description">
          {step === 2 && draft.date
            ? `${bulgarianDate(draft.date, { day: "numeric", month: "long" })} · ${draft.time}`
            : productName
              ? `Проба на ${productName}`
              : "Запазете удобен час за лична проба."}
        </DialogDescription>
        <div className="storefront-booking__progress" aria-hidden="true"><span style={{ transform: `scaleX(${step / 2})` }} /></div>
      </DialogHeader>}

      {step === 1 && <section className="storefront-booking__panel" aria-label="Дата и час">
        <div className="storefront-booking__schedule">
          <div className="storefront-booking__calendar-column">
            <div className="storefront-booking__month">
              <Button type="button" variant="ghost" size="icon" aria-label="Предишен месец" disabled={firstAllowedMonth || loadingAvailability} onClick={() => changeMonth(-1)}><ChevronLeft /></Button>
              <h3 id="booking-calendar-title" className="capitalize">{monthLabel}</h3>
              <Button type="button" variant="ghost" size="icon" aria-label="Следващ месец" disabled={loadingAvailability} onClick={() => changeMonth(1)}><ChevronRight /></Button>
            </div>
            <div className="storefront-booking__weekdays" aria-hidden="true">{["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"].map((day) => <span key={day}>{day}</span>)}</div>
            <div className="storefront-booking__calendar" role="grid" aria-labelledby="booking-calendar-title">
              {days.map((date, index) => {
                if (!date) return <span key={`empty-${index}`} aria-hidden="true" />;
                const day = availability?.days.find((item) => item.date === date);
                const available = Boolean(day?.availableCount) && date >= today;
                const selected = draft.date === date;
                return <button key={date} type="button" role="gridcell" disabled={!available || loadingAvailability} aria-selected={selected} aria-label={`${bulgarianDate(date)}. ${available ? `${day?.availableCount} свободни часа` : "Няма свободни часове"}`} data-date={date} data-today={date === today || undefined} data-selected={selected || undefined} onKeyDown={(event) => handleCalendarKeyDown(event, date)} onClick={() => { update("date", date); update("time", ""); }}>
                  <span>{Number(date.slice(-2))}</span>
                  <small>{available ? day?.availableCount : "—"}</small>
                </button>;
              })}
            </div>
            {loadingAvailability && <p role="status" className="storefront-booking__notice">Зареждаме свободните дати…</p>}
            {!loadingAvailability && availability && !availability.days.some((day) => day.availableCount > 0) && <p className="storefront-booking__notice">Няма свободни часове през този месец. Разгледайте следващия месец или изпратете запитване.</p>}
          </div>

          <div className="storefront-booking__time-column" aria-live="polite">
            <div className="storefront-booking__time-heading">
              <h3 id="booking-time-title">Свободни часове</h3>
              <p>{draft.date ? bulgarianDate(draft.date, { weekday: "long", day: "numeric", month: "long" }) : "Първо изберете дата"}</p>
            </div>
            {draft.date && selectedDay?.slots.length ? (
              <div className="storefront-booking__times" aria-labelledby="booking-time-title">
                {selectedDay.slots.map((slot) => <button key={slot.start} type="button" aria-pressed={draft.time === slot.label} onClick={() => update("time", slot.label)}><Clock3 aria-hidden="true" /><span>{slot.label}</span><small>· {durationMinutes} мин.</small></button>)}
              </div>
            ) : (
              <p className="storefront-booking__time-empty">{draft.date ? "Няма свободни часове за тази дата." : "Свободните часове ще се покажат тук."}</p>
            )}
          </div>
        </div>
        <BookingError error={error} />
        <div className="storefront-booking__actions storefront-booking__actions--split storefront-booking__actions--schedule">
          <p className="storefront-booking__fallback-inline">Не намирате подходящ час? <Link href="/kontakti#contact-form-title" onClick={onClose}>Изпратете запитване</Link></p>
          <Button type="button" className="storefront-button storefront-button--dark" disabled={!draft.date || !draft.time} onClick={() => setStep(2)}>Продължи</Button>
        </div>
      </section>}

      {step === 2 && <form className="storefront-booking__panel storefront-booking__panel--details" aria-labelledby="booking-info-title" onSubmit={(event) => { event.preventDefault(); submit(); }} noValidate>
        <h3 id="booking-info-title" className="sr-only">Лична информация</h3>
        <div className="storefront-booking__form">
          <BookingField id="booking-name" label="Имена" required error={fieldErrors.name}><Input id="booking-name" value={draft.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "booking-name-error" : undefined} /></BookingField>
          <BookingField id="booking-phone" label="Телефон" required error={fieldErrors.phone}><Input id="booking-phone" value={draft.phone} onChange={(event) => update("phone", event.target.value)} type="tel" inputMode="tel" autoComplete="tel" aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? "booking-phone-error" : undefined} /></BookingField>
          <BookingField id="booking-appointmentType" label="Тип на пробата" required error={fieldErrors.appointmentType}><NativeSelect id="booking-appointmentType" value={draft.appointmentType} onChange={(event) => update("appointmentType", event.target.value as BookingDraft["appointmentType"])} aria-invalid={Boolean(fieldErrors.appointmentType)} aria-describedby={fieldErrors.appointmentType ? "booking-appointmentType-error" : undefined}><option value="">Изберете</option>{Object.entries(appointmentTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</NativeSelect></BookingField>
          <BookingField id="booking-companions" label="Придружители (по желание)"><NativeSelect id="booking-companions" value={draft.companions} onChange={(event) => update("companions", Number(event.target.value))}>{Array.from({ length: (availability?.maximumCompanions ?? 0) + 1 }, (_, value) => <option key={value} value={value}>{value}</option>)}</NativeSelect></BookingField>
          <div className="storefront-booking__form-wide"><BookingField id="booking-email" label="Имейл (по желание)" error={fieldErrors.email}><Input id="booking-email" value={draft.email} onChange={(event) => update("email", event.target.value)} type="email" inputMode="email" autoComplete="email" aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "booking-email-error" : undefined} /></BookingField></div>
          <div className="storefront-booking__form-wide"><BookingField id="booking-comment" label="Съобщение (по желание)"><Textarea id="booking-comment" rows={3} value={draft.comment} onChange={(event) => update("comment", event.target.value)} /></BookingField></div>
          <input type="text" name="website" value={draft.website} onChange={(event) => update("website", event.target.value)} tabIndex={-1} autoComplete="off" hidden aria-hidden="true" />
          <div className="storefront-booking__form-wide storefront-booking__consent-wrap">
            <label className="storefront-booking__consent"><Checkbox id="booking-privacyConsent" checked={draft.privacyConsent} onCheckedChange={(checked) => update("privacyConsent", checked === true)} aria-invalid={Boolean(fieldErrors.privacyConsent)} aria-describedby={fieldErrors.privacyConsent ? "booking-privacyConsent-error" : undefined} /><span>Съгласна съм личните ми данни да бъдат използвани за това записване. <Link href="/politika-za-poveritelnost" target="_blank">Политика за поверителност</Link>.</span></label>
            {fieldErrors.privacyConsent && <p id="booking-privacyConsent-error" role="alert" className="storefront-booking__field-error">{fieldErrors.privacyConsent}</p>}
          </div>
        </div>
        <BookingError error={error} />
        <div className="storefront-booking__actions storefront-booking__actions--split"><BackButton onClick={() => setStep(1)} /><Button type="submit" className="storefront-button storefront-button--dark storefront-booking__confirm" disabled={submitting}>{submitting ? "Записване…" : "Потвърди записването"}</Button></div>
      </form>}

      {step === 3 && <section className="storefront-booking__success" aria-live="polite">
        <div className="storefront-booking__success-heading">
          <span className="storefront-booking__success-icon"><CalendarCheck aria-hidden="true" /></span>
          <DialogTitle>Вашият час е записан</DialogTitle>
          <DialogDescription id="booking-dialog-description">{result?.testMode ? "Тестов режим — не е създадена реална резервация." : result?.success}</DialogDescription>
        </div>
        <dl className="storefront-booking__summary">
          <Summary label="Дата" value={bulgarianDate(draft.date)} />
          <Summary label="Час" value={draft.time} />
          <Summary label="Продължителност" value={`${durationMinutes} минути`} />
          <Summary label="Адрес" value={boutiqueAddress} />
        </dl>
        <p className="storefront-booking__success-note">При необходимост екипът на бутика ще се свърже с вас за уточнение.</p>
        <div className="storefront-booking__success-actions">
          <button type="button" className="storefront-booking__calendar-action" onClick={downloadCalendarEvent}><CalendarPlus aria-hidden="true" />Добави в календар</button>
          <DialogClose asChild><Button type="button" className="storefront-button storefront-button--dark storefront-booking__confirm" onClick={onClose}>Затвори</Button></DialogClose>
        </div>
      </section>}

    </div>
  );
}

function BookingField({ id, label, required = false, children, error }: { id: string; label: string; required?: boolean; children: React.ReactNode; error?: string }) {
  return <div className="storefront-booking__field"><Label htmlFor={id}>{label}{required && <span className="storefront-booking__required" aria-hidden="true"> *</span>}</Label>{children}{error && <p id={`${id}-error`} role="alert" className="storefront-booking__field-error">{error}</p>}</div>;
}
function BookingError({ error }: { error: string }) {
  return error ? <p role="alert" className="storefront-booking__error">{error}</p> : null;
}
function BackButton({ onClick, label = "Назад" }: { onClick: () => void; label?: string }) {
  return <button type="button" className="storefront-booking__back" onClick={onClick}><ChevronLeft aria-hidden="true" />{label}</button>;
}
function Summary({ label, value }: { label: string; value: string }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>;
}
