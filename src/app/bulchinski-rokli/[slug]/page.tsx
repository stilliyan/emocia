import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailPage } from "@/components/storefront/product-detail-page";
import { bridalCollection } from "@/lib/storefront-collections";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return bridalCollection.products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = bridalCollection.products.find((item) => item.slug === slug);

  if (!product) return {};

  return {
    title: `${product.name} | Бутик Емоция`,
    description: `Разгледайте ${product.name} и запазете лична проба в Бутик Емоция, Варна.`,
  };
}

export default async function BridalDressPage({ params }: PageProps) {
  const { slug } = await params;
  const product = bridalCollection.products.find((item) => item.slug === slug);

  if (!product) notFound();

  return <ProductDetailPage collection={bridalCollection} product={product} />;
}
