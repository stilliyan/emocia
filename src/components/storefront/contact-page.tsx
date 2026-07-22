import Image from "next/image";
import { AppointmentDialog } from "./appointment-dialog";
import { StorefrontContactSection } from "./contact-section";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import "./storefront.css";

export function ContactPage() {
  return (
    <main className="storefront storefront-contact-page">
      <SiteHeader />
      <section className="storefront-contact-hero" aria-labelledby="contact-page-title">
        <Image
          src="/storefront/contact-hero.webp"
          alt="Усмихната булка край морето"
          fill
          preload
          sizes="100vw"
          className="storefront-contact-hero__image"
        />
        <div className="storefront-contact-hero__shade" aria-hidden="true" />
        <div className="storefront-contact-hero__copy">
          <p>Бутик Емоция · Варна</p>
          <h1 id="contact-page-title">Свържете се с нас</h1>
        </div>
      </section>

      <div className="storefront-content-stack storefront-contact-page__content">
        <section className="storefront-contact-page__lead" aria-labelledby="contact-visit-title">
          <div>
            <h2 id="contact-visit-title">Ще се радваме да ви посрещнем.</h2>
          </div>
          <div className="storefront-contact-page__lead-copy">
            <p>Заповядайте на лична проба в спокойна атмосфера. Ще ви помогнем да откриете силуета, материята и усещането, които са най-подходящи за вас.</p>
            <AppointmentDialog source="contact" className="storefront-button storefront-button--dark">Запази час за проба</AppointmentDialog>
          </div>
        </section>

        <StorefrontContactSection id="контакти" className="storefront-contact-page__main" headingId="contact-form-title" />

        <SiteFooter />
      </div>
    </main>
  );
}
