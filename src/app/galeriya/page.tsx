import type { Metadata } from "next";
import { GalleryPage as StorefrontGalleryPage } from "@/components/storefront/gallery-page";

export const metadata: Metadata = {
  title: "Галерия с наши клиенти | Бутик Емоция",
  description: "Истински моменти от сватби, балове и специални вечери с рокли от Бутик Емоция във Варна.",
};

export default function GalleryPage() {
  return <StorefrontGalleryPage />;
}
