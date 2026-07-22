import { bridalCollection } from "@/lib/storefront-collections";
import { HorizontalDragRail } from "./horizontal-drag-rail";
import { ProductCard } from "./product-card";

export function ProductRail() {
  return (
    <section id="нови-модели" className="storefront-products" aria-labelledby="new-products-title">
      <h2 id="new-products-title">Нови рокли в бутика</h2>
      <HorizontalDragRail
        className="storefront-products__rail"
        ariaLabel="Нови рокли — хоризонтален списък"
      >
        {bridalCollection.products.slice(0, 7).map((product) => (
          <ProductCard
            key={product.slug}
            href={`/${bridalCollection.slug}/${product.slug}`}
            image={product.image}
            alt={product.alt}
            eyebrow={bridalCollection.title}
            name={product.name}
            sizes="(max-width: 640px) 76vw, (max-width: 1024px) 38vw, 23vw"
          />
        ))}
      </HorizontalDragRail>
    </section>
  );
}
