import Image from "next/image";
import { storefrontContact } from "@/lib/storefront-data";
import { AppointmentDialog } from "./appointment-dialog";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import "./storefront.css";

const mapUrl = "https://www.google.com/maps/@43.2121619,27.905135,3a,75y,203.77h,89.3t/data=!3m7!1e1!3m5!1sNS2LLaGNZbpyqNezIFknNw!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D0.6998632793665251%26panoid%3DNS2LLaGNZbpyqNezIFknNw%26yaw%3D203.77218534537914!7i16384!8i8192?entry=ttu&g_ep=EgoyMDI2MDcxNS4wIKXMDSoASAFQAw%3D%3D";

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
            <AppointmentDialog className="storefront-button storefront-button--dark">Запази час за проба</AppointmentDialog>
          </div>
        </section>

        <section className="storefront-contact storefront-contact-page__main" aria-labelledby="contact-form-title">
          <div className="storefront-contact__copy">
            <p className="storefront-eyebrow">Пишете ни</p>
            <h2 id="contact-form-title">Как можем да ви помогнем?</h2>
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
                <textarea name="Съобщение" rows={3} placeholder="Разкажете ни какво търсите…" required />
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
            <a href={mapUrl} target="_blank" rel="noreferrer">
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

function ContactRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return <div><dt>{label}</dt><dd>{href ? <a href={href}>{value}</a> : value}</dd></div>;
}
