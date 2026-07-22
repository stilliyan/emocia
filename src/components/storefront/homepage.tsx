import Image from "next/image";
import Link from "next/link";
import { AnimatedHeroTitle, AnimatedManifestoQuote } from "./animated-copy";
import { AnimatedStats } from "./animated-stats";
import { ProductRail } from "./product-rail";
import { ScrollReelTestimonials } from "./scroll-reel-testimonials";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { AppointmentDialog } from "./appointment-dialog";
import { StorefrontContactSection } from "./contact-section";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "./social-icons";
import { getAllStorefrontCollections, getStorefrontContent, getStorefrontMediaUrl, getStorefrontSettings } from "@/lib/storefront-data";
import "./storefront.css";

const testimonials = [
  {
    quote:
      "От първата среща до последната проба усетих истинско внимание. Открих рокля, която не просто ми стои красиво, а се усеща като моя.",
    author: "Мария Николова · Булка на Бутик Емоция",
    image: "/storefront/product-emery.jpg",
    alt: "Булчинска рокля от Бутик Емоция",
  },
  {
    quote:
      "Пробата беше спокойна и лична. Получих точните насоки, без натиск, и избрах модел, в който се почувствах напълно себе си.",
    author: "Елена Петрова · Булка на Бутик Емоция",
    image: "/storefront/product-nia.jpg",
    alt: "Булка с рокля от Бутик Емоция",
  },
  {
    quote:
      "Всеки детайл беше обсъден с внимание. Резултатът беше елегантна рокля, която отговаряше на стила и усещането, които търсех.",
    author: "Кристина Иванова · Булка на Бутик Емоция",
    image: "/storefront/product-arlo.jpg",
    alt: "Елегантна булчинска рокля от Бутик Емоция",
  },
] as const;

export async function StorefrontHomepage() {
  const [content, settings, [bridal, formal]] = await Promise.all([
    getStorefrontContent(),
    getStorefrontSettings(),
    getAllStorefrontCollections(),
  ]);
  const socialLinks = [
    { label: "TikTok", href: settings.tiktok_url, icon: TikTokIcon },
    { label: "Facebook", href: settings.facebook_url, icon: FacebookIcon },
    { label: "Instagram", href: settings.instagram_url, icon: InstagramIcon },
  ];
  const heroTitle = content.hero_title || "Роклята, в която сте себе си.";
  const heroDescription = content.hero_description || "Булчински и вечерни рокли във Варна.\nПерсонална консултация и внимателно подбрани модели за всеки стил.";
  const featuredProduct = bridal.products.find((product) => product.featured);
  const featureName = featuredProduct?.name || "Aurelia";
  const featureDescription = featuredProduct?.description || featuredProduct?.shortDescription || "Изваян корсет с нежна ръчно бродирана дантела, преливащ в ефирна пола от чиста органза. Всеки детайл е замислен така, че да улавя светлината и движението с неповторима грация.";
  return (
    <main className="storefront storefront-homepage">
      <SiteHeader />
      <div className="storefront-hero-sticky">
        <section className="storefront-hero" aria-labelledby="hero-title">
          <Image
            src={getStorefrontMediaUrl(content.hero_image_path) || "/storefront/hero-ea.png"}
            alt="Булка с елегантна рокля от Бутик Емоция"
            fill
            preload
            quality={90}
            sizes="(max-width: 768px) 280vw, 100vw"
            className="storefront-hero__image"
          />
          <div className="storefront-hero__veil" />
          <div className="storefront-hero__content">
            <div className="storefront-hero__copy">
              <AnimatedHeroTitle
                id="hero-title"
                text={heroTitle}
                desktopBreakBeforeIndices={[3]}
                mobileBreakBeforeIndices={[1, 4]}
              />
              <p style={{ whiteSpace: "pre-line" }}>{heroDescription}</p>
            </div>
            <div className="storefront-hero__actions">
              <AppointmentDialog source="home" className="storefront-button storefront-button--light storefront-button--hero-primary">
                Запазете час за проба
              </AppointmentDialog>
              <Link className="storefront-button storefront-button--text-light" href="/kolekcii">
                <span>Разгледайте колекциите</span>
              </Link>
            </div>
          </div>
          <div className="storefront-hero__socials" aria-label="Социални мрежи">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}>
                <Icon aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>
      </div>

      <div className="storefront-content-stack">
        <section id="колекции" className="storefront-categories" aria-label="Колекции">
          <h2 className="storefront-categories__title">Открийте колекциите</h2>
          <CollectionCard
            href="/bulchinski-rokli"
            image={bridal.heroImage}
            title={bridal.title}
          />
          <CollectionCard
            href="/oficialni-rokli"
            image={formal.heroImage}
            title={formal.title}
          />
        </section>

      <section className="storefront-manifesto">
        <AnimatedManifestoQuote
          lines={[
            "„Вярваме, че правилната рокля не променя жената.",
            "Тя просто ѝ помага да се почувства напълно себе си.“",
          ]}
        />
        <p className="storefront-signature">Veselina M.</p>
      </section>

      <section className="storefront-feature" aria-labelledby="feature-title">
        <div className="storefront-feature__copy">
          <p className="storefront-eyebrow">Модел на месеца</p>
          <h2 id="feature-title">{featureName}</h2>
          <p className="storefront-feature__collection">{featuredProduct?.collection ? `Колекция „${featuredProduct.collection}“` : "Колекция „Небесна нежност“"}</p>
          <p className="storefront-feature__description">{featureDescription}</p>
          <dl>
            <div><dt>Силует</dt><dd>{featuredProduct?.silhouette === "mermaid" ? "Русалка" : featuredProduct?.silhouette === "princess" ? "Принцеса" : featuredProduct?.silhouette === "straight" ? "Прав силует" : "А-линия"}</dd></div>
            <div><dt>Материя</dt><dd>{featuredProduct?.material || "Естествена коприна & органза"}</dd></div>
          </dl>
          <Link className="storefront-button storefront-button--dark" href={featuredProduct ? `/${bridal.slug}/${featuredProduct.slug}` : "#нови-модели"}>Виж детайли</Link>
        </div>
        <div className="storefront-feature__media">
          <Image src={featuredProduct?.image || "/storefront/feature.png"} alt={featuredProduct?.alt || "Булчинска рокля Aurelia"} fill sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
      </section>

      <ProductRail collection={bridal} />

      <section id="за-нас" className="storefront-about" aria-labelledby="about-title">
        <div className="storefront-about__media">
          <Image src="/storefront/cta.png" alt="Интериорът на Бутик Емоция във Варна" fill sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        <div className="storefront-about__copy">
          <p className="storefront-eyebrow">За Бутик Емоция</p>
          <h2 id="about-title">{content.about_title || "Вашето преживяване в Бутик Емоция"}</h2>
          <p>{content.about_content || "Търсенето на вашата специална рокля трябва да бъде незабравимо преживяване. В Бутик Емоция ви посрещаме с лично внимание, спокойна атмосфера и внимателно подбрана селекция от модели."}</p>
          <AnimatedStats />
          <div className="storefront-about__actions">
            <AppointmentDialog source="about" className="storefront-button storefront-button--dark">Запази час за проба</AppointmentDialog>
            <Link className="storefront-about__story-link" href="/za-nas">Прочетете нашата история</Link>
          </div>
        </div>
      </section>

        <section className="storefront-testimonial" aria-label="Отзиви от клиенти">
          <ScrollReelTestimonials testimonials={[...testimonials]} />
        </section>
      </div>

      <div className="storefront-appointment-sticky">
        <section className="storefront-appointment" aria-labelledby="appointment-title">
          <Image src="/storefront/boutique.png" alt="Булка на морския бряг" fill sizes="100vw" />
          <div className="storefront-appointment__overlay" />
          <div className="storefront-appointment__copy">
            <h2 id="appointment-title">Готови ли сте за вашата проба?</h2>
            <p>Запазете своя частен час за лична проба на най-подходящия модел за вас. Нашите консултанти ще се свържат с вас за потвърждение.</p>
            <AppointmentDialog source="home" className="storefront-button storefront-button--light">Запази час</AppointmentDialog>
          </div>
        </section>
      </div>

      <div className="storefront-content-stack">
        <StorefrontContactSection id="контакти" headingId="contact-title" />

        <SiteFooter />
      </div>
    </main>
  );
}

function CollectionCard({
  href,
  image,
  title,
}: {
  href: string;
  image: string;
  title: string;
}) {
  return (
    <Link href={href} className="storefront-category">
      <Image src={image} alt={title} fill sizes="(max-width: 768px) 100vw, 50vw" />
      <div className="storefront-category__blur" aria-hidden="true" />
      <div className="storefront-category__copy">
        <h2>{title}</h2>
        <span className="storefront-category__link-label">Разгледайте моделите</span>
      </div>
    </Link>
  );
}
