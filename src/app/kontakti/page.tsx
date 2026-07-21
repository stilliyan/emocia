import type { Metadata } from "next";
import { StorefrontPlaceholderPage } from "@/components/storefront/storefront-placeholder-page";

export const metadata: Metadata = { title: "Контакти | Бутик Емоция" };

export default function ContactsPage() {
  return <StorefrontPlaceholderPage eyebrow="Бутик Емоция" title="Контакти" description="Свържете се с нас, за да планираме вашето посещение. Страницата се подготвя." />;
}
