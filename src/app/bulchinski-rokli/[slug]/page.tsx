import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailPage } from "@/components/storefront/product-detail-page";
import { bridalCollection } from "@/lib/storefront-collections";
import { getStorefrontCollection } from "@/lib/storefront-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const collection = await getStorefrontCollection(bridalCollection);
  return collection.products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getStorefrontCollection(bridalCollection);
  const product = collection.products.find((item) => item.slug === slug);

  if (!product) return {};

  return {
    title: product.seoTitle || `${product.name} | Бутик Емоция`,
    description: product.metaDescription || product.shortDescription || `Разгледайте ${product.name} и запазете лична проба в Бутик Емоция, Варна.`,
  };
}

export default async function BridalDressPage({ params }: PageProps) {
  const { slug } = await params;
  const collection = await getStorefrontCollection(bridalCollection);
  const product = collection.products.find((item) => item.slug === slug);

  if (!product) notFound();

  return <ProductDetailPage collection={collection} product={product} />;
}
