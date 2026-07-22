import type { Metadata } from "next";
import { StorefrontCollectionPage } from "@/components/storefront/collection-page";
import { bridalCollection } from "@/lib/storefront-collections";
import { getStorefrontCollection } from "@/lib/storefront-data";

export const metadata: Metadata = {
  title: "Булчински рокли | Бутик Емоция",
  description: "Разгледайте подбрани булчински рокли и запазете лична проба в Бутик Емоция, Варна.",
};

export default async function BridalDressesPage() {
  return <StorefrontCollectionPage collection={await getStorefrontCollection(bridalCollection)} />;
}
