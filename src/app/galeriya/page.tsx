import type { Metadata } from "next";
import { StorefrontPlaceholderPage } from "@/components/storefront/storefront-placeholder-page";

export const metadata: Metadata = { title: "Галерия | Бутик Емоция" };

export default function GalleryPage() {
  return <StorefrontPlaceholderPage eyebrow="Вдъхновение" title="Галерия" description="Разгледайте моменти и модели от света на Бутик Емоция. Страницата се подготвя." />;
}
