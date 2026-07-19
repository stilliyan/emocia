"use client";

import { useRef, useState, useTransition } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { generateProductCopy } from "@/app/actions/ai";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Category } from "@/lib/data";
import type { ProductCopyInput, ProductCopyOutput } from "@/lib/ai/product-copy";

type ApplicableKey = Exclude<keyof ProductCopyOutput, "keywords">;
type CurrentValues = Record<ApplicableKey, string>;

const fields: Array<{ key: ApplicableKey; label: string }> = [
  { key: "title", label: "Име на продукта" },
  { key: "shortDescription", label: "Кратко описание" },
  { key: "description", label: "Пълно описание" },
  { key: "altText", label: "Alt текст за основната снимка" },
  { key: "seoTitle", label: "SEO заглавие" },
  { key: "seoDescription", label: "SEO описание" },
];

export function ProductAiAssistant({ categories, imageContext, onApply }: {
  categories: Category[];
  imageContext: string[];
  onApply: (values: Partial<ProductCopyOutput>) => void;
}) {
  const [result, setResult] = useState<ProductCopyOutput | null>(null);
  const [currentValues, setCurrentValues] = useState<CurrentValues | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const generatingRef = useRef(false);

  function contextFromForm(): { input: ProductCopyInput; current: CurrentValues } | null {
    const form = document.getElementById("product-form");
    if (!(form instanceof HTMLFormElement)) return null;
    const data = new FormData(form);
    const category = categories.find((item) => item.id === String(data.get("category_id") ?? ""));
    const name = String(data.get("name") ?? "").trim();
    if (!name || !category) return null;

    const shortDescription = String(data.get("short_description") ?? "");
    const description = String(data.get("description") ?? "");
    const seoTitle = String(data.get("seo_title") ?? "");
    const seoDescription = String(data.get("meta_description") ?? "");
    const altTextInput = document.getElementById("image-alt");
    const altText = altTextInput instanceof HTMLInputElement ? altTextInput.value : "";

    return {
      input: {
        name,
        categoryName: category.name,
        shortDescription,
        description,
        color: String(data.get("color") ?? ""),
        material: String(data.get("material") ?? ""),
        sizes: String(data.get("sizes") ?? ""),
        collection: String(data.get("collection") ?? ""),
        year: String(data.get("year") ?? ""),
        featured: data.get("featured") === "on",
        seoTitle,
        seoDescription,
        imageContext,
      },
      current: { title: name, shortDescription, description, altText, seoTitle, seoDescription },
    };
  }

  function generate() {
    if (generatingRef.current) return;
    const context = contextFromForm();
    if (!context) return toast.error("Попълнете поне име и категория.");
    generatingRef.current = true;
    startTransition(async () => {
      try {
        const response = await generateProductCopy(context.input);
        if (response.error || !response.data) {
          toast.error(response.error || "Възникна грешка при AI генерирането. Опитайте отново.");
          return;
        }
        setCurrentValues(context.current);
        setResult(response.data);
        setOpen(true);
      } finally {
        generatingRef.current = false;
      }
    });
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Текстът е копиран.");
    } catch {
      toast.error("Копирането е неуспешно.");
    }
  }

  function apply(values: Partial<ProductCopyOutput>) {
    onApply(values);
    toast.success("Предложението е приложено локално. Запазете продукта, когато сте готови.");
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium">AI помощник</p>
        <p className="text-xs text-muted-foreground">Подготвя предложения, без да записва или презаписва автоматично.</p>
      </div>
      <Button type="button" size="sm" variant="outline" disabled={pending} onClick={generate}>
        <Sparkles />{pending ? "Генериране…" : "Генерирай с AI"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Преглед на AI предложенията</DialogTitle>
            <DialogDescription>Сравнете текущото съдържание с предложението. Промените остават локални до запазване на продукта.</DialogDescription>
          </DialogHeader>

          {result && currentValues && (
            <div className="space-y-4">
              {fields.map(({ key, label }) => {
                const willReplace = Boolean(currentValues[key].trim());
                return (
                  <section key={key} className="rounded-md border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-medium">{label}</h3>
                      {willReplace && <span className="text-xs text-muted-foreground">Съществуващата стойност ще бъде заменена</span>}
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="rounded-md bg-muted/60 p-3"><p className="text-xs font-medium text-muted-foreground">Текуща стойност</p><p className="mt-2 whitespace-pre-wrap text-sm">{currentValues[key] || "Няма въведена стойност"}</p></div>
                      <div className="rounded-md border p-3"><p className="text-xs font-medium text-muted-foreground">AI предложение</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{result[key]}</p></div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => apply({ [key]: result[key] })}><Check />Използвай</Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => void copy(result[key])}><Copy />Копирай</Button>
                    </div>
                  </section>
                );
              })}

              <section className="rounded-md border p-4">
                <h3 className="text-sm font-medium">Ключови думи</h3>
                <p className="mt-2 text-sm">{result.keywords.join(", ") || "Няма предложения"}</p>
                <p className="mt-2 text-xs text-muted-foreground">Информационно поле — CMS няма отделно поле за ключови думи.</p>
                <Button type="button" size="sm" variant="ghost" className="mt-2" onClick={() => void copy(result.keywords.join(", "))}><Copy />Копирай</Button>
              </section>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            <Button type="button" variant="outline" disabled={pending} onClick={generate}><Sparkles />{pending ? "Генериране…" : "Генерирай отново"}</Button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <DialogClose asChild><Button type="button" variant="ghost">Затвори</Button></DialogClose>
              <Button type="button" disabled={!result} onClick={() => result && apply(result)}><Check />Използвай всички</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
