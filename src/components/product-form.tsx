"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, ChevronDown, Circle } from "lucide-react";
import { saveProduct } from "@/app/actions";
import { ProductAiAssistant } from "@/components/product-ai-assistant";
import { ProductImageManager } from "@/components/product-image-manager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { Category, Product } from "@/lib/data";
import type { ProductCopyOutput } from "@/lib/ai/product-copy";
import { slugifyBulgarian } from "@/lib/slug";

export function ProductForm({ categories, product }: { categories: Category[]; product?: Product | null }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveProduct, null);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [shortDescription, setShortDescription] = useState(product?.short_description ?? "");
  const [fullDescription, setFullDescription] = useState(product?.description ?? "");
  const [seoTitle, setSeoTitle] = useState(product?.seo_title ?? "");
  const [metaDescription, setMetaDescription] = useState(product?.meta_description ?? "");
  const [imageAltText, setImageAltText] = useState(product?.product_images?.find((image) => image.is_cover)?.alt_text ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [status, setStatus] = useState(product?.status ?? "draft");
  const images = product?.product_images ?? [];
  const readiness = [
    { label: "Име и категория", ready: Boolean(name.trim() && categoryId) },
    { label: "Поне една снимка", ready: images.length > 0 },
    { label: "Избрана основна снимка", ready: images.some((image) => image.is_cover) },
    { label: "Текст към всички снимки", ready: images.length > 0 && images.every((image) => image.alt_text?.trim()) },
    { label: "SEO заглавие и описание", ready: Boolean(seoTitle.trim() && metaDescription.trim()) },
  ];
  const readyCount = readiness.filter((item) => item.ready).length;

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    if (state?.success) {
      toast.success(state.success);
      if (state.id && !product) router.replace(`/admin/products/${state.id}`);
    }
  }, [state, router, product]);

  function applyAi(values: Partial<ProductCopyOutput>) {
    if (values.title !== undefined) setName(values.title);
    if (values.shortDescription !== undefined) setShortDescription(values.shortDescription);
    if (values.description !== undefined) setFullDescription(values.description);
    if (values.seoTitle !== undefined) setSeoTitle(values.seoTitle);
    if (values.seoDescription !== undefined) setMetaDescription(values.seoDescription);
    if (values.altText !== undefined) setImageAltText(values.altText);
  }

  return (
    <form id="product-form" action={action} className="mx-auto w-full max-w-5xl space-y-5" noValidate>
      {product && <input type="hidden" name="id" value={product.id} />}
      <Card className="border-foreground/15 bg-muted/25 [--card-spacing:--spacing(4)]">
        <CardHeader className="gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle>Готовност за публикуване</CardTitle><p className="mt-1 text-sm text-muted-foreground">{product ? "Попълнете липсващото преди да публикувате." : "Първо запазете продукта, после добавете снимките."}</p></div>
          <span className="shrink-0 text-sm font-semibold tabular-nums">{readyCount} от {readiness.length} готови</span>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {readiness.map((item) => <div key={item.label} className="flex items-center gap-2 text-sm">{item.ready ? <CheckCircle2 className="size-4 text-emerald-700 dark:text-emerald-400" /> : <Circle className="size-4 text-muted-foreground" />}<span className={item.ready ? "font-medium" : "text-muted-foreground"}>{item.label}</span></div>)}
        </CardContent>
      </Card>

      <Card className="[--card-spacing:--spacing(4)]">
        <CardHeader><CardTitle>Основна информация</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2"><ProductAiAssistant
              categories={categories}
              imageContext={(product?.product_images ?? []).map((image) => image.alt_text || image.storage_path.split("/").at(-1) || "").filter(Boolean)}
              onApply={applyAi}
            /></div>
          <Field label="Име *"><Input name="name" value={name} onChange={(event) => { setName(event.target.value); if (!product) setSlug(slugifyBulgarian(event.target.value)); }} spellCheck={false} autoCorrect="off" autoCapitalize="off" required /></Field>
          <Field label="Адрес (slug) *" hint="Остава постоянен след публикуване."><Input name="slug" value={slug} onChange={(event) => setSlug(event.target.value)} spellCheck={false} autoCorrect="off" autoCapitalize="off" required /></Field>
          <div className="md:col-span-2"><Field label="Кратко описание"><Textarea name="short_description" value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} spellCheck={false} autoCorrect="off" autoCapitalize="off" rows={3} /></Field></div>
          <div className="md:col-span-2"><Field label="Пълно описание"><Textarea name="description" value={fullDescription} onChange={(event) => setFullDescription(event.target.value)} spellCheck={false} autoCorrect="off" autoCapitalize="off" rows={7} /></Field></div>
        </CardContent>
      </Card>

      <Card className="[--card-spacing:--spacing(4)]">
        <CardHeader><CardTitle>Категория и статус</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Категория *">
            <NativeSelect name="category_id" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required>
              <option value="">Изберете</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Статус">
            <NativeSelect name="status" value={status} onChange={(event) => setStatus(event.target.value as Product["status"])}>
              <option value="draft">Непубликуван</option><option value="published">Публикуван</option><option value="archived">Архивиран</option>
            </NativeSelect>
          </Field>
          <label className="flex min-h-10 items-center gap-3 text-sm md:col-span-2"><Checkbox name="featured" defaultChecked={product?.featured} />Избран продукт</label>
        </CardContent>
      </Card>

      <Card className="[--card-spacing:--spacing(4)]">
        <CardHeader><CardTitle>Снимки</CardTitle></CardHeader>
        <CardContent>
          {product ? (
            <ProductImageManager
              key={(product.product_images ?? []).map((image) => `${image.id}:${image.sort_order}:${image.is_cover}`).join("|")}
              productId={product.id}
              images={product.product_images ?? []}
              altText={imageAltText}
              onAltTextChange={setImageAltText}
            />
          ) : <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">Снимките могат да се качат след първото запазване на продукта.</div>}
        </CardContent>
      </Card>

      <Card className="[--card-spacing:--spacing(4)]">
        <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-t-lg px-4 py-4 hover:bg-muted/40"><div><CardTitle>Допълнителни характеристики</CardTitle><p className="mt-1 text-sm text-muted-foreground">По желание: цена, силует, тип аксесоар и продуктови детайли.</p></div><ChevronDown className="size-4 transition-transform group-open:rotate-180" /></summary>
        <CardContent className="grid gap-4 border-t pt-4 md:grid-cols-2">
          <Field label="Цена (лв.)"><Input name="price" type="number" min="0" step="0.01" defaultValue={product?.price ?? ""} /></Field>
          <Field label="Силует"><NativeSelect name="silhouette" defaultValue={product?.silhouette ?? ""}><option value="">Не е избран</option><option value="a-line">А-линия</option><option value="mermaid">Русалка</option><option value="princess">Принцеса</option><option value="straight">Прав силует</option></NativeSelect></Field>
          <Field label="Тип аксесоар"><NativeSelect name="accessory_category" defaultValue={product?.accessory_category ?? ""}><option value="">Не е избран</option><option value="veils">Воали</option><option value="hair">Украси за коса</option><option value="jewellery">Обеци и бижута</option><option value="gloves">Ръкавици</option><option value="glasses">Чаши</option><option value="shoes">Обувки</option><option value="decorations">Украси</option></NativeSelect></Field>
          <Field label="Вътрешен код"><Input name="product_code" defaultValue={product?.product_code ?? ""} /></Field>
          <Field label="Година"><Input name="year" type="number" defaultValue={product?.year ?? ""} /></Field>
          <Field label="Цвят"><Input name="color" defaultValue={product?.color ?? ""} /></Field>
          <Field label="Материал"><Input name="material" defaultValue={product?.material ?? ""} /></Field>
          <Field label="Колекция"><Input name="collection" defaultValue={product?.collection ?? ""} /></Field>
          <Field label="Размери" hint="Разделете със запетая"><Input name="sizes" defaultValue={product?.sizes?.join(", ")} /></Field>
        </CardContent></details>
      </Card>

      <Card className="[--card-spacing:--spacing(4)]">
        <details className="group" open={Boolean(product)}>
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-t-lg px-4 py-4 hover:bg-muted/40"><div><CardTitle>Заглавие и описание за Google</CardTitle><p className="mt-1 text-sm text-muted-foreground">Препоръчително преди публикуване.</p></div><ChevronDown className="size-4 transition-transform group-open:rotate-180" /></summary>
        <CardContent className="grid gap-4 border-t pt-4">
          <Field label="SEO заглавие" hint="До 60 знака"><Input name="seo_title" maxLength={60} value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} spellCheck={false} autoCorrect="off" autoCapitalize="off" /></Field>
          <Field label="Мета описание" hint="До 160 знака"><Textarea name="meta_description" maxLength={160} value={metaDescription} onChange={(event) => setMetaDescription(event.target.value)} spellCheck={false} autoCorrect="off" autoCapitalize="off" /></Field>
        </CardContent></details>
      </Card>

      <div className="flex flex-wrap justify-end gap-3 rounded-lg border bg-background/95 p-3 shadow-sm backdrop-blur-sm md:sticky md:bottom-4 md:z-10">
        <Button type="button" variant="outline" onClick={() => router.back()}>Отказ</Button>
        <Button type="submit" disabled={pending}>{pending ? "Запазване…" : product ? "Запази промените" : "Запази продукт"}</Button>
      </div>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{hint && <p className="text-xs text-muted-foreground">{hint}</p>}</div>;
}
