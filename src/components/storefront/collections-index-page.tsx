import Image from "next/image";
import Link from "next/link";
import { AppointmentDialog } from "./appointment-dialog";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { ProductCard } from "./product-card";
import { getAllStorefrontCollections } from "@/lib/storefront-data";
import "./storefront.css";

export async function CollectionsIndexPage() {
  const [bridalCollection, formalCollection] = await getAllStorefrontCollections();
  const collectionPaths = [bridalCollection, formalCollection].map((collection) => ({
    title: collection.title,
    href: `/${collection.slug}`,
    image: collection.heroImage,
    alt: collection.heroAlt,
  }));
  const latestModels = [
    ...bridalCollection.products.slice(0, 2).map((product) => ({ ...product, collection: bridalCollection })),
    ...formalCollection.products.slice(0, 2).map((product) => ({ ...product, collection: formalCollection })),
  ];
  return (
    <main className="storefront storefront-collections-index">
      <SiteHeader />

      <section className="storefront-collections-index__hero" aria-labelledby="collections-index-title">
        <Image
          src="/storefront/hero-ea.png"
          alt="Подбрани рокли в Бутик Емоция"
          fill
          preload
          quality={90}
          sizes="100vw"
          className="storefront-collections-index__hero-image"
        />
        <div className="storefront-collections-index__hero-shade" aria-hidden="true" />
        <div className="storefront-collections-index__hero-copy">
          <p>Нова селекция</p>
          <h1 id="collections-index-title">Подбрано за вас</h1>
        </div>
      </section>

      <div className="storefront-content-stack storefront-collections-index__content">
        <section
          className="storefront-products storefront-collections-index__latest"
          aria-labelledby="collections-latest-title"
        >
          <h2 id="collections-latest-title">Нови предложения</h2>
          <div className="storefront-products__rail" aria-label="Нови предложения">
            {latestModels.map((model) => (
              <ProductCard
                key={`${model.collection.slug}-${model.slug}`}
                href={`/${model.collection.slug}/${model.slug}`}
                image={model.image}
                alt={model.alt}
                eyebrow={model.collection.title}
                name={model.name}
                sizes="(max-width: 640px) 76vw, (max-width: 1024px) 38vw, 23vw"
              />
            ))}
          </div>
        </section>

        <section className="storefront-collections-index__grid" aria-label="Категории рокли">
          {collectionPaths.map((collection) => (
            <Link className="storefront-category" href={collection.href} key={collection.href}>
              <Image
                src={collection.image}
                alt={collection.alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="storefront-category__blur" aria-hidden="true" />
              <div className="storefront-category__copy">
                <h2>{collection.title}</h2>
                <span className="storefront-category__link-label">Разгледай галерията</span>
              </div>
            </Link>
          ))}
        </section>

        <section className="storefront-collections-index__appointment" aria-labelledby="collections-appointment-title">
          <h2 id="collections-appointment-title">Не сте сигурни откъде да започнете?</h2>
          <div>
            <p>Ще ви помогнем да откриете подходящия силует и усещане по време на лична консултация.</p>
            <AppointmentDialog source="collection" className="storefront-button storefront-button--dark">
              Запази час за проба
            </AppointmentDialog>
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
