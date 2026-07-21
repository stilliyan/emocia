import type { Metadata } from "next";
import { StorefrontPlaceholderPage } from "@/components/storefront/storefront-placeholder-page";

export const metadata: Metadata = { title: "Аксесоари | Бутик Емоция" };

export default function AccessoriesPage() {
  return <StorefrontPlaceholderPage eyebrow="Детайли" title="Аксесоари" description="Финалните детайли за вашата визия. Страницата се подготвя." />;
}
