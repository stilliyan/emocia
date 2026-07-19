import Image from "next/image";
import { Heart } from "lucide-react";
import { storefrontProducts } from "@/lib/storefront-data";

export function ProductRail() {
  return (
    <section id="нови-модели" className="storefront-products" aria-labelledby="new-products-title">
      <h2 id="new-products-title">Нови рокли в бутика</h2>
      <div className="storefront-products__rail">
        {storefrontProducts.map((product, index) => (
          <article className="storefront-product" key={product.name}>
            <div className="storefront-product__image">
              <Image
                src={product.image}
                alt={`${product.name} от колекцията на Бутик Емоция`}
                fill
                sizes="(max-width: 640px) 72vw, (max-width: 1024px) 38vw, 23vw"
                priority={index < 2}
              />
              <Heart aria-hidden="true" className="storefront-product__heart" />
            </div>
            <div className="storefront-product__copy">
              <h3>{product.name}</h3>
              <span>{product.price}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
