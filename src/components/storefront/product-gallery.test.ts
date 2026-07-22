import { describe, expect, it } from "vitest";
import { getProductGalleryImages, getProductGalleryLayout } from "./product-gallery-model";

const product = {
  name: "Тестова рокля",
  slug: "test",
  image: "/cover.jpg",
  alt: "Тестова рокля",
};

describe("getProductGalleryLayout", () => {
  it.each([
    [0, "empty"],
    [1, "single"],
    [2, "double"],
    [3, "multi"],
    [6, "multi"],
  ])("uses the expected layout for %i images", (imageCount, expectedLayout) => {
    expect(getProductGalleryLayout(imageCount)).toBe(expectedLayout);
  });

  it("uses the existing cover exactly once when no image list is supplied", () => {
    expect(getProductGalleryImages(product)).toEqual([
      { src: "/cover.jpg", alt: "Тестова рокля" },
    ]);
  });

  it("preserves an explicit empty image list", () => {
    expect(getProductGalleryImages({ ...product, images: [] })).toEqual([]);
  });

  it.each([2, 3, 5])("returns exactly %i supplied images without filling slots", (imageCount) => {
    const images = Array.from({ length: imageCount }, (_, index) => ({
      src: `/image-${index + 1}.jpg`,
      alt: `Изображение ${index + 1}`,
    }));

    expect(getProductGalleryImages({ ...product, images })).toEqual(images);
    expect(getProductGalleryImages({ ...product, images })).toHaveLength(imageCount);
  });
});
