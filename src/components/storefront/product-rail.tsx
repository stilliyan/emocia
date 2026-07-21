import Image from "next/image";
import Link from "next/link";
import { bridalCollection } from "@/lib/storefront-collections";

export function ProductRail() {
  return (
    <section id="нови-модели" className="storefront-products" aria-labelledby="new-products-title">
      <h2 id="new-products-title">Нови рокли в бутика</h2>
      <div className="storefront-products__rail">
        {bridalCollection.products.slice(0, 7).map((product, index) => (
          <Link
            href={`/${bridalCollection.slug}/${product.slug}`}
            className="storefront-collection-card-link"
            key={product.slug}
          >
            <article className="storefront-collection-card">
              <div className="storefront-collection-card__media">
                <Image
                  src={product.image}
                  alt={product.alt}
                  fill
                  sizes="(max-width: 640px) 76vw, (max-width: 1024px) 38vw, 23vw"
                  priority={index < 2}
                />
                <div className="storefront-collection-card__veil" aria-hidden="true" />
                <span className="storefront-collection-card__action" aria-hidden="true">
                  Разгледай
                </span>
              </div>
              <h3>{product.name}</h3>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
