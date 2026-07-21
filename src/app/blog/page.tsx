import type { Metadata } from "next";
import { StorefrontPlaceholderPage } from "@/components/storefront/storefront-placeholder-page";

export const metadata: Metadata = { title: "Съвети за булката | Бутик Емоция" };

export default function BlogPage() {
  return <StorefrontPlaceholderPage eyebrow="Полезно за вас" title="Съвети за булката" description="Практични насоки за избора, пробата и специалния ден. Страницата се подготвя." />;
}
