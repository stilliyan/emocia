"use client";

import Link from "next/link";
import { useId, useMemo, useState, useTransition } from "react";
import { CalendarCheck, ChevronDown } from "lucide-react";
import { submitAppointmentRequest, type AppointmentRequestState } from "@/app/actions/appointments";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

type RequiredFieldErrors = { name?: string; phone?: string };

function requiredFieldError(field: keyof RequiredFieldErrors, value: string) {
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
  const [showDetails, setShowDetails] = useState(Boolean(productName));
  const [pending, startTransition] = useTransition();
  const limits = useMemo(() => ({ min: dateValue(), max: dateValue(180) }), []);
  const compact = variant === "compact-contact";
  const simpleContact = variant === "simple-contact";

  function requiredFieldErrors(form: FormData): RequiredFieldErrors {
    return {
      name: requiredFieldError("name", String(form.get("name") ?? "")),
      phone: requiredFieldError("phone", String(form.get("phone") ?? "")),
    };
  }

  function validateField(field: keyof RequiredFieldErrors, value: string) {
    setFieldErrors((current) => ({ ...current, [field]: requiredFieldError(field, value) }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    const nextFieldErrors = requiredFieldErrors(form);
    setFieldErrors(nextFieldErrors);
    const firstInvalidField = (Object.keys(nextFieldErrors) as Array<keyof RequiredFieldErrors>).find((field) => nextFieldErrors[field]);
    if (firstInvalidField) {
      const field = event.currentTarget.elements.namedItem(firstInvalidField);
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
      <div hidden aria-hidden="true">
        <label htmlFor={`${id}-website`}>Уебсайт</label>
        <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className={cn("grid gap-4 sm:grid-cols-2", compact && "storefront-contact-form__primary-fields")}>
        <div className="space-y-2">
          <Label className={simpleContact ? "sr-only" : undefined} htmlFor={`${id}-name`}>Име *</Label>
          <Input id={`${id}-name`} name="name" autoComplete="name" placeholder="Вашето име" required aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? `${id}-name-error` : undefined} onBlur={(event) => validateField("name", event.currentTarget.value)} onChange={(event) => fieldErrors.name && validateField("name", event.currentTarget.value)} />
          {fieldErrors.name && <p id={`${id}-name-error`} role="alert" className="storefront-contact-form__field-error">{fieldErrors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label className={simpleContact ? "sr-only" : undefined} htmlFor={`${id}-phone`}>Телефон *</Label>
          <Input id={`${id}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="Телефонен номер" required aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? `${id}-phone-error` : undefined} onBlur={(event) => validateField("phone", event.currentTarget.value)} onChange={(event) => fieldErrors.phone && validateField("phone", event.currentTarget.value)} />
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
        <div className="space-y-2"><Label className={simpleContact ? "sr-only" : undefined} htmlFor={`${id}-message`}>Съобщение{!simpleContact && <span className="font-normal text-muted-foreground"> (по желание)</span>}</Label><Textarea id={`${id}-message`} name="message" rows={compact ? 2 : 3} placeholder={simpleContact ? "Напишете съобщението си…" : "Размер или друго уточнение…"} /></div>
      </div>
      {!compact && !simpleContact && <p className="text-xs leading-relaxed text-muted-foreground">Заявката не е автоматично потвърждение. Екипът ни ще ви потърси по телефона.</p>}
      {result.error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{result.error}</p>}
      {result.success && <p role="status" className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-800">{result.success}</p>}
      <Button type="submit" className={cn("h-11", simpleContact && "storefront-button storefront-button--dark")} disabled={pending}>{pending ? "Изпращане…" : submitLabel}</Button>
      {compact ? <div className="storefront-contact-form__footer"><p>Ще се свържем с вас по телефона за потвърждение.</p><Link href="/politika-za-poveritelnost">Политика за поверителност</Link></div> : !simpleContact && <p className="mx-auto max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">С изпращането на заявката се съгласявате данните ви да бъдат използвани за връзка относно пробата. <Link href="/politika-za-poveritelnost" className="underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Политика за поверителност</Link></p>}
    </form>
  );
}

export function AppointmentDialog({ children, className, productName, productId, source, ariaLabel, open: controlledOpen, onOpenChange }: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [result, setResult] = useState<AppointmentRequestState>({});
  const open = controlledOpen ?? internalOpen;

  function handleOpenChange(next: boolean) {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
    if (!next) setResult({});
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild><button type="button" className={className} aria-label={ariaLabel}>{children}</button></DialogTrigger>}
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        {result.success ? (
          <div className="grid gap-5 py-3 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-foreground text-background"><CalendarCheck className="size-5" /></span>
            <div><DialogTitle>{result.testMode ? "Тестът е успешен" : "Получихме заявката"}</DialogTitle><DialogDescription className="mt-2">{result.success}</DialogDescription></div>
            <DialogClose asChild><Button type="button">Затвори</Button></DialogClose>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Заявка за проба</DialogTitle>
              <DialogDescription>{productName ? `Заявете удобен час за проба на ${productName}.` : "Посочете удобни дата и час. Ще се свържем с вас за потвърждение."}</DialogDescription>
            </DialogHeader>
            <AppointmentRequestForm source={source} productName={productName} productId={productId} onSuccess={setResult} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
