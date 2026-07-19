"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteCategory, saveCategory } from "@/app/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "@/lib/data";
import { slugifyBulgarian } from "@/lib/slug";

export function CategoryManager({ categories }: { categories: Category[] }) {
  return <div className="grid gap-4 lg:grid-cols-2">{categories.map((category) => <CategoryForm key={category.id} category={category} />)}<CategoryForm /></div>;
}

function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveCategory, null);
  const [deleting, startDelete] = useTransition();
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  useEffect(() => { if (state?.error) toast.error(state.error); if (state?.success) toast.success(state.success); }, [state]);

  function removeCategory() {
    if (!category) return;
    startDelete(async () => {
      const result = await deleteCategory(category.id);
      if (result.error) toast.error(result.error);
      else { toast.success(result.success); router.refresh(); }
    });
  }

  return <Card className="[--card-spacing:--spacing(4)]"><CardHeader><CardTitle>{category ? category.name : "Нова категория"}</CardTitle></CardHeader><CardContent><form action={action} className="space-y-4" noValidate>
    {category && <input type="hidden" name="id" value={category.id} />}
    <div className="space-y-2"><Label>Име *</Label><Input name="name" value={name} onChange={(event) => { const next=event.target.value; setName(next); if(!category) setSlug(slugifyBulgarian(next)); }} spellCheck={false} autoCorrect="off" autoCapitalize="off" required /></div>
    <div className="space-y-2"><Label>Адрес в сайта *</Label><Input name="slug" value={slug} onChange={(event) => setSlug(event.target.value)} spellCheck={false} autoCorrect="off" autoCapitalize="off" required /><p className="text-xs text-muted-foreground">Попълва се автоматично от името.</p></div>
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"><Checkbox name="active" defaultChecked={category?.active ?? true} />Активна категория</label>
    <div className="flex items-center justify-between gap-3">
      <Button type="submit" disabled={pending || deleting} variant={category ? "outline" : "default"}>{pending ? "Запазване…" : category ? "Запази" : "Добави категория"}</Button>
      {category && <AlertDialog>
        <AlertDialogTrigger asChild><Button type="button" size="icon-sm" variant="destructive" aria-label="Изтрий категорията" disabled={pending || deleting}><Trash2 /></Button></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Изтриване на категория</AlertDialogTitle><AlertDialogDescription>Сигурни ли сте, че искате да изтриете тази категория?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel type="button">Отказ</AlertDialogCancel><AlertDialogAction type="button" variant="destructive" onClick={removeCategory}>Изтрий категория</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>}
    </div>
  </form></CardContent></Card>;
}
