import type { StorefrontCollectionProduct, StorefrontProductImage } from "../../lib/storefront-collections";

export type ProductGalleryLayout = "empty" | "single" | "double" | "multi";

export function getProductGalleryLayout(imageCount: number): ProductGalleryLayout {
  if (imageCount === 0) return "empty";
  if (imageCount === 1) return "single";
  if (imageCount === 2) return "double";
  return "multi";
}

export function getProductGalleryImages(product: StorefrontCollectionProduct): ReadonlyArray<StorefrontProductImage> {
  if (product.images !== undefined) return product.images;
  return product.image ? [{ src: product.image, alt: product.alt }] : [];
}
