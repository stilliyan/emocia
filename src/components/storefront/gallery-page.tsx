import Image from "next/image";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import "./storefront.css";

const galleryImages = [
  { src: "/storefront/gallery/client-01.webp", className: "storefront-gallery-grid__item--feature", alt: "Булка в дантелена сватбена рокля" },
  { src: "/storefront/gallery/client-03.webp", className: "", alt: "Абитуриентка в дълга вечерна рокля" },
  { src: "/storefront/gallery/client-04.webp", className: "", alt: "Клиентка на Бутик Емоция във вечерна рокля" },
  { src: "/storefront/gallery/client-05.webp", className: "", alt: "Двойка преди специален повод" },
  { src: "/storefront/gallery/client-06.webp", className: "storefront-gallery-grid__item--feature", alt: "Двойка в официални облекла" },
  { src: "/storefront/gallery/client-07.webp", className: "", alt: "Клиентка с роза във вечерна рокля" },
  { src: "/storefront/gallery/client-08.webp", className: "storefront-gallery-grid__item--feature", alt: "Булка с букет край морето" },
] as const;

export function GalleryPage() {
  return (
    <main className="storefront storefront-gallery-page">
      <section className="storefront-gallery-hero" aria-labelledby="gallery-title">
        <Image
          src="/storefront/gallery/client-02.webp"
          alt="Клиентка на Бутик Емоция във вечерна рокля"
          fill
          priority
          sizes="100vw"
          className="storefront-gallery-hero__image"
        />
        <div className="storefront-gallery-hero__shade" aria-hidden="true" />
        <SiteHeader />
        <div className="storefront-gallery-hero__copy">
          <p>Истински моменти</p>
          <h1 id="gallery-title">Нашите клиенти</h1>
        </div>
      </section>

      <div className="storefront-content-stack storefront-gallery-content">
        <section className="storefront-gallery-intro" aria-labelledby="gallery-intro-title">
          <p className="storefront-eyebrow">Галерия</p>
          <h2 id="gallery-intro-title">Рокли, превърнати в спомени</h2>
          <p>Моменти от сватби, балове и специални вечери, споделени от клиентите на Бутик Емоция.</p>
        </section>

        <section className="storefront-gallery-grid" aria-label="Галерия с клиенти на Бутик Емоция">
          {galleryImages.map((image) => (
            <figure
              className={`storefront-gallery-grid__item ${image.className}`.trim()}
              key={image.src}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={image.className ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
              />
            </figure>
          ))}
        </section>

        <div className="storefront-gallery-note">
          <p>Всеки специален ден има своята емоция.</p>
        </div>

        <SiteFooter />
      </div>
    </main>
  );
}
