import Image from "next/image";
import { AnimatedManifestoQuote } from "./animated-copy";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import "./storefront.css";

const galleryImages = [
  { src: "/storefront/gallery/client-02.webp", shape: "landscape", alt: "Клиентка на Бутик Емоция в елегантна вечерна рокля" },
  { src: "/storefront/gallery/client-01.webp", shape: "tall", alt: "Булка в дантелена сватбена рокля" },
  { src: "/storefront/gallery/client-03.webp", shape: "portrait", alt: "Абитуриентка в дълга вечерна рокля" },
  { src: "/storefront/gallery/client-04.webp", shape: "classic", alt: "Клиентка на Бутик Емоция във вечерна рокля" },
  { src: "/storefront/gallery/client-05.webp", shape: "landscape", alt: "Двойка преди специален повод" },
  { src: "/storefront/gallery/client-06.webp", shape: "portrait", alt: "Двойка в официални облекла" },
  { src: "/storefront/gallery/client-07.webp", shape: "tall", alt: "Клиентка с роза във вечерна рокля" },
  { src: "/storefront/gallery/client-08.webp", shape: "classic", alt: "Булка с букет край морето" },
  { src: "/storefront/gallery/client-10.webp", shape: "tall", alt: "Абитуриентка в блестяща вечерна рокля край морето" },
  { src: "/storefront/gallery/client-11.webp", shape: "portrait", alt: "Абитуриентка в дълга вечерна рокля край басейн" },
  { src: "/storefront/gallery/client-12.webp", shape: "landscape", alt: "Двойка преди абитуриентски бал" },
  { src: "/storefront/gallery/client-13.webp", shape: "classic", alt: "Клиенти на Бутик Емоция преди специален повод" },
] as const;

export function GalleryPage() {
  return (
    <main className="storefront storefront-gallery-page">
      <SiteHeader />
      <section className="storefront-gallery-hero" aria-labelledby="gallery-title">
        <Image
          src="/storefront/gallery/client-02.webp"
          alt="Клиентка на Бутик Емоция във вечерна рокля"
          fill
          preload
          sizes="100vw"
          className="storefront-gallery-hero__image"
        />
        <div className="storefront-gallery-hero__shade" aria-hidden="true" />
        <div className="storefront-gallery-hero__copy">
          <p>Истински моменти</p>
          <h1 id="gallery-title">Нашите клиенти</h1>
        </div>
      </section>

      <div className="storefront-content-stack storefront-gallery-content">
        <section className="storefront-gallery-grid" aria-label="Галерия с клиенти на Бутик Емоция">
          {galleryImages.map((image) => (
            <figure
              className={`storefront-gallery-grid__item storefront-gallery-grid__item--${image.shape}`}
              key={image.src}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 50vw, 34vw"
              />
            </figure>
          ))}
        </section>

        <div className="storefront-gallery-note">
          <AnimatedManifestoQuote lines={["Всеки специален ден", "има своята емоция."]} />
          <p className="storefront-gallery-note__signature">Veselina M.</p>
        </div>

        <SiteFooter />
      </div>
    </main>
  );
}
