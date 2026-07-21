import Image from "next/image";
import Link from "next/link";
import { storefrontContact } from "@/lib/storefront-data";
import { AnimatedHeroTitle, AnimatedManifestoQuote } from "./animated-copy";
import { AnimatedStats } from "./animated-stats";
import { ProductRail } from "./product-rail";
import { ScrollReelTestimonials } from "./scroll-reel-testimonials";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { AppointmentDialog } from "./appointment-dialog";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "./social-icons";
import "./storefront.css";

const socialLinks = [
  { label: "TikTok", icon: TikTokIcon },
  { label: "Facebook", icon: FacebookIcon },
  { label: "Instagram", icon: InstagramIcon },
] as const;

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

export function StorefrontHomepage() {
  return (
    <main className="storefront storefront-homepage">
      <SiteHeader />
      <div className="storefront-hero-sticky">
        <section className="storefront-hero" aria-labelledby="hero-title">
          <Image
            src="/storefront/hero-ea.png"
            alt="Булка с елегантна рокля от Бутик Емоция"
            fill
            priority
            quality={90}
            sizes="(max-width: 768px) 280vw, 100vw"
            className="storefront-hero__image"
          />
          <div className="storefront-hero__veil" />
          <div className="storefront-hero__content">
            <div className="storefront-hero__copy">
              <AnimatedHeroTitle
                id="hero-title"
                text="Роклята, в която сте себе си."
                desktopBreakBeforeIndices={[3]}
                mobileBreakBeforeIndices={[1, 4]}
              />
              <p>Булчински и вечерни рокли във Варна.<br />Персонална консултация и внимателно подбрани модели за всеки стил.</p>
            </div>
            <div className="storefront-hero__actions">
              <AppointmentDialog className="storefront-button storefront-button--light">Запазете час за проба</AppointmentDialog>
              <Link className="storefront-button storefront-button--outline-light" href="#нови-модели">Разгледайте колекциите</Link>
            </div>
          </div>
          <div className="storefront-hero__socials" aria-label="Социални мрежи">
            {socialLinks.map(({ label, icon: Icon }) => (
              <a key={label} href="#footer" aria-label={label}><Icon aria-hidden="true" /></a>
            ))}
          </div>
        </section>
      </div>

      <div className="storefront-content-stack">
        <section id="колекции" className="storefront-categories" aria-label="Колекции">
          <h2 className="storefront-categories__title">Открийте колекциите</h2>
          <CollectionCard href="/bulchinski-rokli" image="/storefront/category-bridal.jpg" title="Булчински рокли" />
          <CollectionCard href="#нови-модели" image="/storefront/category-evening.jpg" title="Вечерни рокли" />
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
          <h2 id="feature-title">Aurelia</h2>
          <p className="storefront-feature__collection">Колекция „Небесна нежност“</p>
          <p className="storefront-feature__description">Изваян корсет с нежна ръчно бродирана дантела, преливащ в ефирна пола от чиста органза. Всеки детайл е замислен така, че да улавя светлината и движението с неповторима грация.</p>
          <dl>
            <div><dt>Силует</dt><dd>А-линия</dd></div>
            <div><dt>Материя</dt><dd>Естествена коприна &amp; органза</dd></div>
          </dl>
          <Link className="storefront-button storefront-button--dark" href="#нови-модели">Виж детайли</Link>
        </div>
        <div className="storefront-feature__media">
          <Image src="/storefront/feature.png" alt="Булчинска рокля Aurelia" fill sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
      </section>

      <ProductRail />

      <section id="за-нас" className="storefront-about" aria-labelledby="about-title">
        <div className="storefront-about__media">
          <Image src="/storefront/cta.png" alt="Интериорът на Бутик Емоция във Варна" fill sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        <div className="storefront-about__copy">
          <p className="storefront-eyebrow">За Бутик Емоция</p>
          <h2 id="about-title">Вашето преживяване в Бутик Емоция</h2>
          <p>Търсенето на вашата специална рокля трябва да бъде незабравимо преживяване. В Бутик Емоция ви посрещаме с лично внимание, спокойна атмосфера и внимателно подбрана селекция от модели.</p>
          <AnimatedStats />
          <AppointmentDialog className="storefront-button storefront-button--dark">Запази час за проба</AppointmentDialog>
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
            <AppointmentDialog className="storefront-button storefront-button--light">Запази час</AppointmentDialog>
          </div>
        </section>
      </div>

      <div className="storefront-content-stack">
        <section id="контакти" className="storefront-contact" aria-labelledby="contact-title">
          <div className="storefront-contact__copy">
            <p className="storefront-eyebrow">Контакти</p>
            <h2 id="contact-title">Свържете се с нас</h2>
            <form
              className="storefront-contact-form"
              action={`mailto:${storefrontContact.email}?subject=${encodeURIComponent("Запитване от сайта")}`}
              method="post"
              encType="text/plain"
            >
              <div className="storefront-contact-form__fields">
                <label>
                  <span>Име</span>
                  <input type="text" name="Име" autoComplete="name" placeholder="Вашето име" required />
                </label>
                <label>
                  <span>Телефон</span>
                  <input type="tel" name="Телефон" autoComplete="tel" placeholder="Телефонен номер" required />
                </label>
              </div>
              <label>
                <span>Съобщение</span>
                <textarea name="Съобщение" rows={3} placeholder="Напишете съобщението си…" required />
              </label>
              <button className="storefront-button storefront-button--dark" type="submit">Изпрати запитване</button>
            </form>
            <dl>
              <ContactRow label="Адрес" value={storefrontContact.address} />
              <ContactRow label="Телефон" value={storefrontContact.phone} href={`tel:${storefrontContact.phone.replace(/\s/g, "")}`} />
              <ContactRow label="Електронна поща" value={storefrontContact.email} href={`mailto:${storefrontContact.email}`} />
              <ContactRow label="Работно време" value={storefrontContact.hours} />
            </dl>
          </div>
          <div className="storefront-contact__map">
            <iframe
              title="Карта до Бутик Емоция във Варна"
              src="https://www.google.com/maps?q=%D0%B3%D1%80.%20%D0%92%D0%B0%D1%80%D0%BD%D0%B0%2C%20%D0%B1%D1%83%D0%BB.%20%D0%92%D0%BB.%20%D0%92%D0%B0%D1%80%D0%BD%D0%B5%D0%BD%D1%87%D0%B8%D0%BA%2069&output=embed"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              href="https://www.google.com/maps/@43.2121619,27.905135,3a,75y,203.77h,89.3t/data=!3m7!1e1!3m5!1sNS2LLaGNZbpyqNezIFknNw!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D0.6998632793665251%26panoid%3DNS2LLaGNZbpyqNezIFknNw%26yaw%3D203.77218534537914!7i16384!8i8192?entry=ttu&g_ep=EgoyMDI2MDcxNS4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noreferrer"
            >
              <Image
                src="/storefront/boutique-facade.png"
                alt=""
                width={184}
                height={184}
                className="storefront-contact__map-thumbnail"
              />
              <span>Намерете ни в Google Maps</span>
            </a>
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}

function CollectionCard({ href, image, title }: { href: string; image: string; title: string }) {
  return (
    <Link href={href} className="storefront-category">
      <Image src={image} alt={title} fill sizes="(max-width: 768px) 100vw, 50vw" />
      <div className="storefront-category__blur" aria-hidden="true" />
      <div><h2>{title}</h2><p>Разгледай колекцията <span aria-hidden="true">→</span></p></div>
    </Link>
  );
}

function ContactRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return <div><dt>{label}</dt><dd>{href ? <a href={href}>{value}</a> : value}</dd></div>;
}
