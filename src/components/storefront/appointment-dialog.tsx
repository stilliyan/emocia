"use client";

import { useMemo, useState, useTransition } from "react";
import { CalendarCheck } from "lucide-react";
import { submitAppointmentRequest, type AppointmentRequestState } from "@/app/actions/appointments";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  children: React.ReactNode;
  className?: string;
  productName?: string;
  ariaLabel?: string;
};

function dateValue(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function AppointmentDialog({ children, className, productName, ariaLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<AppointmentRequestState>({});
  const [pending, startTransition] = useTransition();
  const limits = useMemo(() => ({ min: dateValue(), max: dateValue(180) }), []);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setResult({});
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    setResult({});
    startTransition(async () => setResult(await submitAppointmentRequest(form)));
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button type="button" className={className} aria-label={ariaLabel}>{children}</button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        {result.success ? (
          <div className="grid gap-5 py-3 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-foreground text-background"><CalendarCheck className="size-5" /></span>
            <div><DialogTitle>Заявката е изпратена</DialogTitle><DialogDescription className="mt-2">{result.success}</DialogDescription></div>
            <DialogClose asChild><Button type="button">Затвори</Button></DialogClose>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Заявка за проба</DialogTitle>
              <DialogDescription>{productName ? `Заявете удобен час за проба на ${productName}.` : "Посочете удобни дата и час. Ще се свържем с вас за потвърждение."}</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="grid gap-4" noValidate>
              <input type="hidden" name="product_name" value={productName ?? ""} />
              <div className="absolute -left-[9999px]" aria-hidden="true"><label>Уебсайт<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="appointment-name">Име *</Label><Input id="appointment-name" name="name" autoComplete="name" placeholder="Вашето име" required /></div>
                <div className="space-y-2"><Label htmlFor="appointment-phone">Телефон *</Label><Input id="appointment-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="Телефонен номер" required /></div>
                <div className="space-y-2"><Label htmlFor="appointment-date">Предпочитана дата *</Label><Input id="appointment-date" name="preferred_date" type="date" min={limits.min} max={limits.max} required /></div>
                <div className="space-y-2"><Label htmlFor="appointment-time">Предпочитан час *</Label><Input id="appointment-time" name="preferred_time" type="time" min="10:00" max="18:00" step="1800" required /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="appointment-message">Съобщение</Label><Textarea id="appointment-message" name="message" rows={3} placeholder="Размер, модел или друго уточнение…" /></div>
              <p className="text-xs text-muted-foreground">Заявката не е автоматично потвърждение. Ще ви потърсим по телефона.</p>
              {result.error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{result.error}</p>}
              <Button type="submit" className="h-11" disabled={pending}>{pending ? "Изпращане…" : "Изпрати заявка"}</Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
