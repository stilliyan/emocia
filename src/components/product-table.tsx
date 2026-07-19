"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { ImageIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteProduct, deleteProducts } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Product, ProductImage } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";

const labels = { draft: "Непубликуван", published: "Публикуван", archived: "Архивиран" };

function preferredImage(images: ProductImage[] | undefined) {
  return images?.find((image) => image.is_cover) ?? images?.slice().sort((a, b) => a.sort_order - b.sort_order)[0];
}

function ProductThumbnail({ product }: { product: Product }) {
  const image = preferredImage(product.product_images);
  if (!image) return <div className="grid size-12 place-items-center rounded-md bg-muted"><ImageIcon className="size-5 text-muted-foreground" /></div>;
  const url = createClient().storage.from("product-images").getPublicUrl(image.storage_path).data.publicUrl;
  // Supabase supplies the remote hostname dynamically per project.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={image.alt_text || product.name || "Продуктова снимка"} className="size-12 rounded-md bg-muted object-cover" />;
}

export function ProductTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const allSelected = products.length > 0 && products.every((product) => selected.has(product.id));
  const selectedIds = useMemo(() => products.filter((product) => selected.has(product.id)).map((product) => product.id), [products, selected]);

  function runDelete(ids: string[], bulk = false) {
    startTransition(async () => {
      const result = bulk ? await deleteProducts(ids) : await deleteProduct(ids[0]);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setSelected((current) => {
        const next = new Set(current);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      toast.success(result.success);
      router.refresh();
    });
  }

  return (
    <div>
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/40 px-4 py-3">
          <span className="text-sm font-medium">Избрани продукти: {selectedIds.length}</span>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button type="button" variant="destructive" size="sm" disabled={pending}><Trash2 />Изтрий избраните</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Изтриване на избрани продукти</AlertDialogTitle><AlertDialogDescription>Сигурни ли сте, че искате да изтриете избраните продукти? Това действие не може да бъде отменено.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel type="button">Отказ</AlertDialogCancel><AlertDialogAction type="button" variant="destructive" onClick={() => runDelete(selectedIds, true)}>Изтрий избраните</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      <div className="divide-y md:hidden">
        {products.map((product) => (
          <div key={product.id} className="flex items-start gap-3 p-4">
            <ProductThumbnail product={product} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{product.name}</p>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{product.categories?.name ?? "Без категория"}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant={product.status === "published" ? "default" : "secondary"}>{labels[product.status]}</Badge>
                <Button asChild variant="outline" size="sm"><Link href={`/admin/products/${product.id}`}>Редактирай</Link></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button type="button" variant="destructive" size="icon-sm" aria-label={`Изтрий ${product.name}`} disabled={pending}><Trash2 /></Button></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Изтриване на продукт</AlertDialogTitle><AlertDialogDescription>Сигурни ли сте, че искате да изтриете този продукт? Това действие не може да бъде отменено.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel type="button">Отказ</AlertDialogCancel><AlertDialogAction type="button" variant="destructive" onClick={() => runDelete([product.id])}>Изтрий продукт</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader><TableRow>
            <TableHead className="w-10"><Checkbox aria-label="Избери всички продукти" checked={allSelected} onCheckedChange={(checked) => setSelected(checked ? new Set(products.map((product) => product.id)) : new Set())} /></TableHead>
            <TableHead>Снимка</TableHead><TableHead>Продукт</TableHead><TableHead>Категория</TableHead><TableHead>Статус</TableHead><TableHead>Обновен</TableHead><TableHead className="text-right">Действия</TableHead>
          </TableRow></TableHeader>
          <TableBody>{products.map((product) => (
            <TableRow key={product.id} data-state={selected.has(product.id) ? "selected" : undefined}>
              <TableCell><Checkbox aria-label="Избери продукт" checked={selected.has(product.id)} onCheckedChange={(checked) => setSelected((current) => { const next = new Set(current); if (checked) next.add(product.id); else next.delete(product.id); return next; })} /></TableCell>
              <TableCell><ProductThumbnail product={product} /></TableCell>
              <TableCell><div className="font-medium">{product.name}</div>{product.featured && <span className="text-xs text-primary">Избран продукт</span>}</TableCell>
              <TableCell>{product.categories?.name ?? "—"}</TableCell>
              <TableCell><Badge variant={product.status === "published" ? "default" : "secondary"}>{labels[product.status]}</Badge></TableCell>
              <TableCell>{new Intl.DateTimeFormat("bg-BG").format(new Date(product.updated_at))}</TableCell>
              <TableCell><div className="flex justify-end gap-2">
                <Button asChild variant="outline" size="sm"><Link href={`/admin/products/${product.id}`}>Редактирай</Link></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button type="button" variant="destructive" size="icon-sm" aria-label="Изтрий продукта" disabled={pending}><Trash2 /></Button></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Изтриване на продукт</AlertDialogTitle><AlertDialogDescription>Сигурни ли сте, че искате да изтриете този продукт? Това действие не може да бъде отменено.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel type="button">Отказ</AlertDialogCancel><AlertDialogAction type="button" variant="destructive" onClick={() => runDelete([product.id])}>Изтрий продукт</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </div>
    </div>
  );
}
