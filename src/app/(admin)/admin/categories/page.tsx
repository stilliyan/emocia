import { PageHeader } from "@/components/page-header";import { CategoryManager } from "@/components/category-manager";import { getCategories } from "@/lib/data";
export default async function Categories(){return <><PageHeader title="Категории" description="Подреждайте продуктите в ясни групи. Категория с продукти не може да бъде изтрита."/><CategoryManager categories={await getCategories()}/></>}

