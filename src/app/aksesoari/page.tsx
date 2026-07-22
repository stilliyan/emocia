import type { Metadata } from "next";
import { StorefrontCollectionPage } from "@/components/storefront/collection-page";
import { accessoriesCollection } from "@/lib/storefront-collections";
import { getStorefrontCollection } from "@/lib/storefront-data";

export const metadata: Metadata = {
  title: "Аксесоари | Бутик Емоция",
  description: "Аксесоари и финални детайли за вашата визия от Бутик Емоция, Варна.",
};

export default async function AccessoriesPage() {
  return <StorefrontCollectionPage collection={await getStorefrontCollection(accessoriesCollection)} />;
}
