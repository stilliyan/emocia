import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ProductTable } from "@/components/product-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { getProducts } from "@/lib/data";

export default async function Products({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const params = await searchParams;
  const products = await getProducts(params);
  return <>
    <PageHeader title="Продукти" description="Добавяйте, редактирайте и публикувайте модели." action={<Button asChild><Link href="/admin/products/new"><Plus />Добави продукт</Link></Button>} />
    <form className="mb-4 flex flex-col gap-3 sm:flex-row">
      <Input name="q" defaultValue={params.q} placeholder="Търси по име…" className="sm:max-w-sm" />
      <NativeSelect name="status" defaultValue={params.status ?? ""} className="sm:w-48"><option value="">Всички статуси</option><option value="draft">Непубликувани</option><option value="published">Публикувани</option><option value="archived">Архивирани</option></NativeSelect>
      <Button type="submit" variant="outline">Филтрирай</Button>
    </form>
    <Card><CardContent className="p-0">{products.length ? <ProductTable products={products} /> : <div className="p-12 text-center"><div className="mx-auto grid size-12 place-items-center rounded-full bg-muted text-xl">—</div><h2 className="mt-4 font-semibold">Няма намерени продукти</h2><p className="mt-1 text-sm text-muted-foreground">Променете филтрите или добавете първия модел.</p></div>}</CardContent></Card>
  </>;
}
