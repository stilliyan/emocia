"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ImagePlus, Star, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  deleteProductImage,
  registerProductImage,
  reorderProductImages,
  setPrimaryProductImage,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductImage } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { slugifyBulgarian } from "@/lib/slug";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function safeFilename(filename: string) {
  const dot = filename.lastIndexOf(".");
  const rawBase = dot > 0 ? filename.slice(0, dot) : filename;
  const extension = dot > 0 ? filename.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "jpg";
  return `${slugifyBulgarian(rawBase) || "image"}.${extension}`;
}

export function ProductImageManager({ productId, images, altText, onAltTextChange }: { productId: string; images: ProductImage[]; altText: string; onAltTextChange: (value: string) => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [orderedImages, setOrderedImages] = useState(images);
  const [pending, startTransition] = useTransition();

  async function uploadFiles(files: File[]) {
    if (!files.length) return;
    const invalidType = files.find((file) => !ACCEPTED_TYPES.has(file.type));
    if (invalidType) return toast.error(`„${invalidType.name}“ не е JPG, PNG, WebP или AVIF.`);
    const oversized = files.find((file) => file.size > MAX_FILE_SIZE);
    if (oversized) return toast.error(`„${oversized.name}“ е по-голям от 10 MB.`);

    setUploading(true);
    const supabase = createClient();
    try {
      for (const file of files) {
        const storagePath = `products/${productId}/${Date.now()}-${safeFilename(file.name)}`;
        const { error: uploadError } = await supabase.storage.from("product-images").upload(storagePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });
        if (uploadError) throw new Error(uploadError.message);

        const result = await registerProductImage({
          productId,
          storagePath,
          altText,
          mimeType: file.type,
          byteSize: file.size,
        });
        if (result.error) {
          await supabase.storage.from("product-images").remove([storagePath]);
          throw new Error(result.error);
        }
      }
      toast.success(files.length === 1 ? "Снимката е качена успешно." : "Снимките са качени успешно.");
      onAltTextChange("");
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? `Качването е неуспешно: ${error.message}` : "Качването е неуспешно.");
    } finally {
      setUploading(false);
    }
  }

  function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= orderedImages.length) return;
    const next = [...orderedImages];
    [next[index], next[target]] = [next[target], next[index]];
    setOrderedImages(next);
    startTransition(async () => {
      const result = await reorderProductImages(productId, next.map((image) => image.id));
      if (result.error) {
        setOrderedImages(images);
        toast.error(result.error);
      } else {
        toast.success(result.success);
        router.refresh();
      }
    });
  }

  function publicUrl(path: string) {
    return createClient().storage.from("product-images").getPublicUrl(path).data.publicUrl;
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="image-alt">Алтернативен текст</Label>
        <Input id="image-alt" value={altText} onChange={(event) => onAltTextChange(event.target.value)} placeholder="Напр. Булчинска рокля с дантела отпред" spellCheck={false} autoCorrect="off" autoCapitalize="off" />
        <p className="text-xs text-muted-foreground">Ще бъде приложен към снимките от следващото качване.</p>
      </div>

      <div
        className={`rounded-xl border border-dashed p-8 text-center outline-none transition-[border-color,box-shadow,background-color] duration-150 focus-within:border-black/50 focus-within:ring-2 focus-within:ring-black/10 ${dragging ? "border-primary bg-muted" : "border-border hover:border-black/25"}`}
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void uploadFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <ImagePlus className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">Пуснете снимките тук или изберете файлове</p>
        <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WebP или AVIF · максимум 10 MB на файл</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif"
          className="sr-only"
          onChange={(event) => void uploadFiles(Array.from(event.target.files ?? []))}
        />
        <Button type="button" className="mt-4" disabled={uploading} onClick={() => inputRef.current?.click()}>
          <Upload />{uploading ? "Качване…" : "Избери снимки"}
        </Button>
      </div>

      {orderedImages.length === 0 ? (
        <p className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">Все още няма качени снимки.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {orderedImages.map((image, index) => (
            <div key={image.id} className="overflow-hidden rounded-md border bg-background">
              {/* Supabase Storage URLs are dynamic per project; native img avoids a hard-coded remote host. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={publicUrl(image.storage_path)} alt={image.alt_text || "Продуктова снимка"} className="aspect-square w-full bg-muted object-cover sm:aspect-[4/5]" />
              <div className="space-y-3 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-muted-foreground">{image.alt_text || "Без алтернативен текст"}</span>
                  {image.is_cover && <span className="shrink-0 text-xs font-medium">Основна</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" disabled={pending || image.is_cover} onClick={() => startTransition(async () => {
                    const result = await setPrimaryProductImage(productId, image.id);
                    if (result.error) toast.error(result.error);
                    else toast.success(result.success);
                    router.refresh();
                  })}><Star />Основна</Button>
                  <Button type="button" size="icon-sm" variant="outline" aria-label="Премести нагоре" disabled={pending || index === 0} onClick={() => moveImage(index, -1)}><ArrowUp /></Button>
                  <Button type="button" size="icon-sm" variant="outline" aria-label="Премести надолу" disabled={pending || index === orderedImages.length - 1} onClick={() => moveImage(index, 1)}><ArrowDown /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button type="button" size="icon-sm" variant="destructive" aria-label="Изтрий снимката"><Trash2 /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Изтриване на снимката?</AlertDialogTitle><AlertDialogDescription>Файлът и връзката му с продукта ще бъдат изтрити окончателно.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Отказ</AlertDialogCancel><AlertDialogAction onClick={() => startTransition(async () => {
                        const result = await deleteProductImage(productId, image.id);
                        if (result.error) toast.error(result.error);
                        else toast.success(result.success);
                        router.refresh();
                      })}>Изтрий</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
