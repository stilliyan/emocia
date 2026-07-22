import type { Metadata } from "next";
import { CollectionsIndexPage } from "@/components/storefront/collections-index-page";

export const metadata: Metadata = {
  title: "Колекции рокли | Бутик Емоция",
  description: "Разгледайте булчински и официални рокли в Бутик Емоция, Варна, и запазете час за лична проба.",
};

export default function CollectionsPage() {
  return <CollectionsIndexPage />;
}
