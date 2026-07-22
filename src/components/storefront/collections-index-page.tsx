import Image from "next/image";
import Link from "next/link";
import { AppointmentDialog } from "./appointment-dialog";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { HorizontalDragRail } from "./horizontal-drag-rail";
import { ProductCard } from "./product-card";
import { bridalCollection, formalCollection } from "@/lib/storefront-collections";
import "./storefront.css";

const collectionPaths = [
  {
    title: "Булчински рокли",
    description: "Силуети за деня, който остава завинаги ваш.",
    href: "/bulchinski-rokli",
    image: "/storefront/category-bridal.jpg",
    alt: "Булчинска рокля от селекцията на Бутик Емоция",
  },
  {
    title: "Официални рокли",
    description: "Елегантни модели за балове, сватби и специални вечери.",
    href: "/oficialni-rokli",
    image: "/storefront/category-evening.jpg",
    alt: "Официална рокля от селекцията на Бутик Емоция",
  },
] as const;

const latestModels = [
  { ...bridalCollection.products[0], collection: bridalCollection },
  { ...bridalCollection.products[1], collection: bridalCollection },
  { ...formalCollection.products[0], collection: formalCollection },
  { ...formalCollection.products[1], collection: formalCollection },
] as const;

export function CollectionsIndexPage() {
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
          <HorizontalDragRail
            className="storefront-products__rail"
            ariaLabel="Нови предложения — хоризонтален списък"
          >
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
          </HorizontalDragRail>
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
            <AppointmentDialog className="storefront-button storefront-button--dark">
              Запази час за проба
            </AppointmentDialog>
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
