import type { Metadata } from "next";
import { StorefrontCollectionPage } from "@/components/storefront/collection-page";
import { bridalCollection } from "@/lib/storefront-collections";

export const metadata: Metadata = {
  title: "Булчински рокли | Бутик Емоция",
  description: "Разгледайте подбрани булчински рокли и запазете лична проба в Бутик Емоция, Варна.",
};

export default function BridalDressesPage() {
  return <StorefrontCollectionPage collection={bridalCollection} />;
}
