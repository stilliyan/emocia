import type { Metadata } from "next";
import { StorefrontCollectionPage } from "@/components/storefront/collection-page";
import { formalCollection } from "@/lib/storefront-collections";

export const metadata: Metadata = {
  title: "Официални рокли | Бутик Емоция",
  description: "Подбрани официални рокли за специални поводи в Бутик Емоция, Варна.",
};

export default function FormalDressesPage() {
  return <StorefrontCollectionPage collection={formalCollection} />;
}
