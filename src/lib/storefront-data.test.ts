import { describe, expect, it } from "vitest";
import { buildStorefrontCollection } from "./storefront-data";
import type { StorefrontCollection } from "./storefront-collections";

const fallbackCollection: StorefrontCollection = {
  kind: "dresses",
  slug: "bulchinski-rokli",
  eyebrow: "Колекция",
  title: "Булчински рокли",
  description: "Описание",
  heroImage: "/collection-hero.jpg",
  heroAlt: "Колекция",
  products: [
    {
      name: "Fallback модел",
      slug: "fallback-model",
      image: "/fallback-product.jpg",
      alt: "Fallback модел",
    },
  ],
};

const activeCategory = {
  id: "category-id",
  name: "Булчински рокли",
  slug: "bulchinski-rokli",
  active: true,
  sort_order: 0,
};

function cmsProduct(productImages: Array<{
  storage_path: string;
  alt_text: string;
  sort_order: number;
  is_cover: boolean;
}> = []) {
  return {
    id: "cms-product-id",
    name: "CMS модел",
    slug: "cms-model",
    short_description: null,
    description: null,
    product_code: null,
    sizes: null,
    color: null,
    material: null,
    collection: null,
    year: null,
    seo_title: null,
    meta_description: null,
    featured: false,
    sort_order: 0,
    price: null,
    silhouette: null,
    accessory_category: null,
    categories: {
      id: activeCategory.id,
      name: activeCategory.name,
      slug: activeCategory.slug,
      active: true,
    },
    product_images: productImages,
  };
}

describe("buildStorefrontCollection", () => {
  it("treats an available CMS collection with zero published products as empty", () => {
    const collection = buildStorefrontCollection(fallbackCollection, [activeCategory], []);

    expect(collection.products).toEqual([]);
  });

  it("keeps the compatibility catalogue only when the public CMS is unavailable", () => {
    expect(buildStorefrontCollection(fallbackCollection, null, null)).toBe(fallbackCollection);
  });

  it("keeps an explicit empty CMS image list without substituting a fallback image", () => {
    const [product] = buildStorefrontCollection(
      fallbackCollection,
      [activeCategory],
      [cmsProduct()],
    ).products;

    expect(product.image).toBe("");
    expect(product.images).toEqual([]);
  });

  it.each([1, 2, 3, 5])("preserves exactly %i CMS images in their configured order", (imageCount) => {
    const productImages = Array.from({ length: imageCount }, (_, index) => ({
      storage_path: `https://images.example/model-${imageCount - index}.jpg`,
      alt_text: `Изображение ${imageCount - index}`,
      sort_order: imageCount - index,
      is_cover: index === 0,
    }));

    const [product] = buildStorefrontCollection(
      fallbackCollection,
      [activeCategory],
      [cmsProduct(productImages)],
    ).products;

    expect(product.images).toEqual(
      [...productImages]
        .sort((left, right) => left.sort_order - right.sort_order)
        .map((image) => ({ src: image.storage_path, alt: image.alt_text })),
    );
    expect(product.images).toHaveLength(imageCount);
    expect(new Set(product.images?.map((image) => image.src)).size).toBe(imageCount);
  });
});
