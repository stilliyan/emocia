import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailPage } from "@/components/storefront/product-detail-page";
import { accessoriesCollection } from "@/lib/storefront-collections";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return accessoriesCollection.products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = accessoriesCollection.products.find((item) => item.slug === slug);

  if (!product) return {};

  return {
    title: `${product.name} | Бутик Емоция`,
    description: `Разгледайте ${product.name} и го съчетайте с вашата визия в Бутик Емоция, Варна.`,
  };
}

export default async function AccessoryPage({ params }: PageProps) {
  const { slug } = await params;
  const product = accessoriesCollection.products.find((item) => item.slug === slug);

  if (!product) notFound();

  return <ProductDetailPage collection={accessoriesCollection} product={product} />;
}
