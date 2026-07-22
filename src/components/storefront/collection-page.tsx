import Image from "next/image";
import type { StorefrontCollection } from "@/lib/storefront-collections";
import { AnimatedHeroTitle } from "./animated-copy";
import { CollectionCatalogue } from "./collection-catalogue";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import "./storefront.css";

export function StorefrontCollectionPage({ collection }: { collection: StorefrontCollection }) {
  return (
    <main className="storefront storefront-collection-page">
      <SiteHeader />

      <div className="storefront-collection-page__foreground">
        <section className="storefront-collection-hero" aria-labelledby="collection-title">
          <Image
            src={collection.heroImage}
            alt={collection.heroAlt}
            fill
            preload
            quality={90}
            sizes="100vw"
            className="storefront-collection-hero__image"
          />
          <div className="storefront-collection-hero__veil" aria-hidden="true" />
          <div className="storefront-collection-hero__copy">
            <p>{collection.eyebrow}</p>
            <AnimatedHeroTitle id="collection-title" text={collection.title} />
          </div>
        </section>

        <div className="storefront-content-stack storefront-collection-content">
          <CollectionCatalogue
            collectionSlug={collection.slug}
            collectionTitle={collection.title}
            products={collection.products}
          />
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
