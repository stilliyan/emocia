"use client";

import { useState, useTransition } from "react";
import { PackageCheck } from "lucide-react";
import { submitOrderRequest, type OrderRequestState } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  children: React.ReactNode;
  className?: string;
  productSlug: string;
  productName: string;
  price: string;
};

export function OrderDialog({ children, className, productSlug, productName, price }: Props) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<OrderRequestState>({});
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const formData = new FormData(event.currentTarget);
    setResult({});
    startTransition(async () => setResult(await submitOrderRequest(formData)));
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setResult({}); }}>
      <DialogTrigger asChild><button type="button" className={className}>{children}</button></DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        {result.success ? (
          <div className="grid gap-5 py-3 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-foreground text-background"><PackageCheck className="size-5" /></span>
            <div><DialogTitle>Заявката е изпратена</DialogTitle><DialogDescription className="mt-2">{result.success}</DialogDescription></div>
            <DialogClose asChild><Button type="button">Затвори</Button></DialogClose>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Поръчка на {productName}</DialogTitle>
              <DialogDescription>{price} · Плащане с наложен платеж при получаване.</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="grid gap-4" noValidate>
              <input type="hidden" name="product_slug" value={productSlug} />
              <div className="absolute -left-[9999px]" aria-hidden="true"><label>Уебсайт<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="order-name">Име *</Label><Input id="order-name" name="name" autoComplete="name" placeholder="Вашето име" required /></div>
                <div className="space-y-2"><Label htmlFor="order-phone">Телефон *</Label><Input id="order-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="Телефонен номер" required /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="order-delivery">Доставка *</Label><Textarea id="order-delivery" name="delivery_details" rows={2} autoComplete="street-address" placeholder="Град, адрес или офис на куриер" required /></div>
              <div className="space-y-2"><Label htmlFor="order-message">Уточнение</Label><Textarea id="order-message" name="message" rows={3} placeholder="Количество или друго уточнение…" /></div>
              <p className="text-xs leading-5 text-muted-foreground">Заявката не е автоматично потвърдена поръчка. Ще се свържем с вас за наличността, доставката и крайната сума.</p>
              {result.error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{result.error}</p>}
              <Button type="submit" className="h-11" disabled={pending}>{pending ? "Изпращане…" : "Изпрати заявка"}</Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
