import {
  formatStorefrontPrice,
  type StorefrontCollection,
  type StorefrontCollectionProduct,
} from "../../lib/storefront-collections";
import { PinnedHorizontalRail } from "./pinned-horizontal-rail";
import { ProductCard } from "./product-card";

type MixedProduct = {
  collection: StorefrontCollection;
  product: StorefrontCollectionProduct;
  label: "БУЛЧИНСКА" | "ОФИЦИАЛНА";
};

export function mixedProducts(
  bridal: StorefrontCollection,
  formal: StorefrontCollection,
): MixedProduct[] {
  const bridalProducts = bridal.products.slice(0, 4);
  const formalProducts = formal.products.slice(0, 3);
  const products: MixedProduct[] = [];

  for (let index = 0; index < 4; index += 1) {
    const bridalProduct = bridalProducts[index];
    const formalProduct = formalProducts[index];

    if (bridalProduct) {
      products.push({
        collection: bridal,
        product: bridalProduct,
        label: "БУЛЧИНСКА",
      });
    }
    if (formalProduct) {
      products.push({
        collection: formal,
        product: formalProduct,
        label: "ОФИЦИАЛНА",
      });
    }
  }

  return products;
}

export function ProductRail({
  bridal,
  formal,
}: {
  bridal: StorefrontCollection;
  formal: StorefrontCollection;
}) {
  const products = mixedProducts(bridal, formal);

  if (products.length === 0) {
    return (
      <section
        id="нови-модели"
        className="storefront-products storefront-products--mixed storefront-products--empty"
        aria-labelledby="new-products-title"
      >
        <h2 id="new-products-title">Нови попълнения в бутика</h2>
        <p className="storefront-products__empty-state" role="status">
          Новите публикувани модели ще се появят тук.
        </p>
      </section>
    );
  }

  return (
    <PinnedHorizontalRail
      itemCount={products.length}
      title="Нови попълнения в бутика"
      titleId="new-products-title"
      ariaLabel="Нови булчински и официални рокли — хоризонтален списък"
    >
      {products.map(({ collection, product, label }) => (
        <ProductCard
          key={`${collection.slug}-${product.slug}`}
          href={`/${collection.slug}/${product.slug}`}
          image={product.image}
          alt={product.alt}
          eyebrow={label}
          name={product.name}
          price={formatStorefrontPrice(product.price)}
          sizes="(max-width: 640px) 76vw, (max-width: 1024px) 38vw, 23vw"
        />
      ))}
    </PinnedHorizontalRail>
  );
}
