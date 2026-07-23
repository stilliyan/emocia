import { describe, expect, it } from "vitest";
import {
  bridalCollection,
  formalCollection,
} from "../../lib/storefront-collections";
import { mixedProducts } from "./product-rail";

describe("mixedProducts", () => {
  it("interleaves four bridal and three formal products without replacing their data", () => {
    const products = mixedProducts(bridalCollection, formalCollection);

    expect(products).toHaveLength(7);
    expect(products.map(({ label }) => label)).toEqual([
      "БУЛЧИНСКА",
      "ОФИЦИАЛНА",
      "БУЛЧИНСКА",
      "ОФИЦИАЛНА",
      "БУЛЧИНСКА",
      "ОФИЦИАЛНА",
      "БУЛЧИНСКА",
    ]);
    expect(products.map(({ collection, product }) => `${collection.slug}/${product.slug}`)).toEqual([
      "bulchinski-rokli/lincoln",
      "oficialni-rokli/amalia",
      "bulchinski-rokli/nia",
      "oficialni-rokli/celesta",
      "bulchinski-rokli/arlo",
      "oficialni-rokli/eliana",
      "bulchinski-rokli/lowe",
    ]);
  });

  it("uses only the available products when a collection contains fewer items", () => {
    const products = mixedProducts(
      { ...bridalCollection, products: bridalCollection.products.slice(0, 2) },
      { ...formalCollection, products: formalCollection.products.slice(0, 1) },
    );

    expect(products).toHaveLength(3);
    expect(products.map(({ label }) => label)).toEqual([
      "БУЛЧИНСКА",
      "ОФИЦИАЛНА",
      "БУЛЧИНСКА",
    ]);
  });
});
