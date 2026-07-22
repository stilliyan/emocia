import Image from "next/image";
import { getStorefrontContent, getStorefrontSettings } from "@/lib/storefront-data";
import { AppointmentDialog } from "./appointment-dialog";
import { ScrollRevealSection } from "./scroll-reveal-section";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import "./storefront.css";

const storyChapters = [
  {
    number: "01",
    title: "Началото",
    copy: "Пътят на Веселина в булчинската мода започва преди повече от две десетилетия. Опитът сред материи, силуети и бъдещи булки постепенно се превръща в ясна идея: изборът на рокля заслужава време, спокойствие и истинско лично внимание.",
    image: "/storefront/category-bridal.jpg",
    alt: "Булчинска рокля от селекцията на Бутик Емоция",
  },
  {
    number: "02",
    title: "Собствен път",
    copy: "Така се появява Бутик Емоция — независимо бутиково пространство във Варна, изградено с много работа, постоянство и няколко смели нови начала. През годините адресите се променят, но отношението към всяка жена остава непроменено.",
    image: "/storefront/boutique-facade.png",
    alt: "Входът на Бутик Емоция във Варна",
  },
  {
    number: "03",
    title: "Днес",
    copy: "Днес всяка проба е лична среща, а не просто избор от каталог. Моделите са подбрани с внимание към движението, материята и характера на жената, която ще ги носи — за да си тръгне не просто с красива рокля, а със своята рокля.",
    image: "/storefront/product-emery.jpg",
    alt: "Елегантна булчинска рокля в Бутик Емоция",
  },
] as const;

const values = [
  {
    title: "Лично отношение",
    copy: "Вслушваме се във вас и ви насочваме без натиск, с внимание към усещането, което търсите.",
  },
  {
    title: "Опит, който се усеща",
    copy: "Повече от две десетилетия познание за силуетите, материите и малките детайли, които променят всичко.",
  },
  {
    title: "Селекция с характер",
    copy: "Подбираме модели, които съчетават съвременна линия, прецизна изработка и присъствие.",
  },
] as const;

export async function AboutPage() {
  const [content, settings] = await Promise.all([getStorefrontContent(), getStorefrontSettings()]);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "За Бутик Емоция",
    url: "https://emocia.vercel.app/za-nas",
    mainEntity: {
      "@type": "ClothingStore",
      name: settings.shop_name,
      description: "Бутиково пространство за булчински и официални рокли във Варна с лично отношение и повече от две десетилетия опит.",
      address: {
        "@type": "PostalAddress",
        streetAddress: settings.address,
        addressLocality: "Варна",
        addressCountry: "BG",
      },
      telephone: settings.contact_phone,
      email: settings.contact_email,
      sameAs: [
        settings.instagram_url,
        settings.facebook_url,
        settings.tiktok_url,
      ],
    },
  };

  return (
    <main className="storefront storefront-about-page">
      <SiteHeader />

      <section className="storefront-about-page__hero" aria-labelledby="about-page-title">
        <Image
          src="/storefront/boutique.png"
          alt="Булка край морето с рокля от Бутик Емоция"
          fill
          preload
          quality={90}
          sizes="100vw"
          className="storefront-about-page__hero-image"
        />
        <div className="storefront-about-page__hero-shade" aria-hidden="true" />
        <div className="storefront-about-page__hero-copy">
          <p>Бутик Емоция · Варна</p>
          <h1 id="about-page-title">История, създадена с внимание.</h1>
        </div>
      </section>

      <div className="storefront-content-stack storefront-about-page__content">
        <ScrollRevealSection
          className="storefront-about-page__intro storefront-about-page__reveal"
          labelledBy="about-intro-title"
        >
          <h2 id="about-intro-title">{content.about_title || "Повече от две десетилетия близо до най-важния избор."}</h2>
          <div>
            <p>{content.about_content || "Бутик Емоция не е създаден наведнъж. Той израства през годините — с много работа, смели нови начала и вяра, че всяка жена заслужава да бъде видяна и разбрана, когато избира роклята за своя специален ден."}</p>
            <p>За нас луксът не е показност. Той е времето, което отделяме, спокойствието по време на пробата и увереността, с която си тръгвате.</p>
          </div>
        </ScrollRevealSection>

        <div className="storefront-about-page__story" aria-label="Историята на Бутик Емоция">
          {storyChapters.map((chapter, index) => (
            <ScrollRevealSection
              className={`storefront-about-page__chapter storefront-about-page__chapter--${index + 1} storefront-about-page__reveal`}
              labelledBy={`about-chapter-${index + 1}`}
              key={chapter.title}
            >
              <div className="storefront-about-page__chapter-media">
                <Image
                  src={chapter.image}
                  alt={chapter.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="storefront-about-page__chapter-copy">
                <div className="storefront-about-page__timeline" aria-hidden="true">
                  <span />
                </div>
                <span aria-hidden="true">{chapter.number}</span>
                <h2 id={`about-chapter-${index + 1}`}>{chapter.title}</h2>
                <p>{chapter.copy}</p>
              </div>
            </ScrollRevealSection>
          ))}
        </div>

        <ScrollRevealSection
          className="storefront-about-page__quote storefront-about-page__reveal"
          labelledBy="about-quote-title"
        >
          <Image
            src="/storefront/cta.png"
            alt="Интериорът на Бутик Емоция във Варна"
            fill
            sizes="100vw"
          />
          <div className="storefront-about-page__quote-shade" aria-hidden="true" />
          <div className="storefront-about-page__quote-copy">
            <p id="about-quote-title">„Всяка специална рокля има своята емоция. Нашата работа е да ви помогнем да откриете вашата.“</p>
            <span>Veselina M.</span>
          </div>
        </ScrollRevealSection>

        <ScrollRevealSection
          className="storefront-about-page__values storefront-about-page__reveal"
          labelledBy="about-values-title"
        >
          <h2 id="about-values-title">Начинът, по който работим</h2>
          <div className="storefront-about-page__values-grid">
            {values.map((value) => (
              <article key={value.title}>
                <h3>{value.title}</h3>
                <p>{value.copy}</p>
              </article>
            ))}
          </div>
        </ScrollRevealSection>

        <section className="storefront-about-page__appointment" aria-labelledby="about-appointment-title">
          <div>
            <h2 id="about-appointment-title">Вашата история може да започне тук.</h2>
            <p>Заповядайте на лична проба в Бутик Емоция във Варна.</p>
          </div>
          <AppointmentDialog source="about" className="storefront-button storefront-button--dark">
            Запази час за проба
          </AppointmentDialog>
        </section>

        <SiteFooter />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
    </main>
  );
}
