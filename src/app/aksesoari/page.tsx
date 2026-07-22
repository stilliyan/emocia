import type { Metadata } from "next";
import { StorefrontCollectionPage } from "@/components/storefront/collection-page";
import { accessoriesCollection } from "@/lib/storefront-collections";

export const metadata: Metadata = {
  title: "Аксесоари | Бутик Емоция",
  description: "Аксесоари и финални детайли за вашата визия от Бутик Емоция, Варна.",
};

export default function AccessoriesPage() {
  return <StorefrontCollectionPage collection={accessoriesCollection} />;
}
