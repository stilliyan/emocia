import type { Metadata } from "next";
import { StorefrontPlaceholderPage } from "@/components/storefront/storefront-placeholder-page";

export const metadata: Metadata = { title: "Официални рокли | Бутик Емоция" };

export default function FormalDressesPage() {
  return <StorefrontPlaceholderPage eyebrow="Колекции" title="Официални рокли" description="Подбрани модели за специалните ви поводи. Страницата се подготвя." />;
}
