import Image from "next/image";
import Link from "next/link";
import { Camera, MessageCircle, Music2 } from "lucide-react";
import { storefrontContact } from "@/lib/storefront-data";
import { ProductRail } from "./product-rail";
import { StorefrontLogo } from "./logo";
import { SiteHeader } from "./site-header";
import "./storefront.css";

const socialLinks = [
  { label: "TikTok", icon: Music2 },
  { label: "Facebook", icon: MessageCircle },
  { label: "Instagram", icon: Camera },
] as const;

export function StorefrontHomepage() {
  return (
    <main className="storefront">
      <section className="storefront-hero" aria-labelledby="hero-title">
        <Image
          src="/storefront/hero.png"
          alt="Булка с елегантна рокля от Бутик Емоция"
          fill
          priority
          sizes="100vw"
          className="storefront-hero__image"
        />
        <div className="storefront-hero__veil" />
        <SiteHeader />
        <div className="storefront-hero__content">
          <h1 id="hero-title">Открийте роклята, в която се чувствате като себе си.</h1>
          <p>Булчински и вечерни рокли във Варна.<br />Персонална консултация и внимателно подбрани модели за всеки стил.</p>
          <Link className="storefront-button storefront-button--light" href="#контакти">Запазете час за проба</Link>
        </div>
        <div className="storefront-hero__socials" aria-label="Социални мрежи">
          {socialLinks.map(({ label, icon: Icon }) => (
            <a key={label} href="#footer" aria-label={label}><Icon aria-hidden="true" /></a>
          ))}
        </div>
      </section>

      <section id="колекции" className="storefront-categories" aria-label="Колекции">
        <CollectionCard image="/storefront/category-bridal.jpg" title="Булчински рокли" />
        <CollectionCard image="/storefront/category-evening.jpg" title="Вечерни рокли" />
      </section>

      <section className="storefront-manifesto">
        <blockquote>„Вярваме, че правилната рокля не променя жената.<br />Тя просто ѝ помага да се почувства напълно себе си.“</blockquote>
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
          <div className="storefront-about__stats">
            <div><strong>300+</strong><span>Доволни булки</span></div>
            <div><strong>15+</strong><span>Години опит</span></div>
            <div><strong>98%</strong><span>Препоръчват ни</span></div>
          </div>
          <Link className="storefront-button storefront-button--dark" href="#контакти">Запази час за проба</Link>
        </div>
      </section>

      <section className="storefront-testimonial" aria-label="Отзив от клиент">
        <div className="storefront-testimonial__summary">
          <span aria-hidden="true">✦</span>
          <p>Доверие от<br /><strong>20+ семейства.</strong></p>
          <small>Вашите моменти са нашето вдъхновение</small>
        </div>
        <blockquote>
          <div className="storefront-testimonial__dots" aria-hidden="true"><i /><i /><i /><i /></div>
          <p>„От първата среща до последната проба усетих истинско внимание. Помогнаха ми да открия рокля, която не просто ми стои красиво, а се усеща като моя.“</p>
          <footer>
            <Image src="/storefront/avatar.png" alt="" width={48} height={48} />
            <span><strong>Мария Николова</strong><small>Булка на Бутик Емоция</small></span>
            <em>Емоция</em>
          </footer>
        </blockquote>
      </section>

      <section className="storefront-appointment" aria-labelledby="appointment-title">
        <Image src="/storefront/boutique.png" alt="Булка на морския бряг" fill sizes="100vw" />
        <div className="storefront-appointment__overlay" />
        <div className="storefront-appointment__copy">
          <h2 id="appointment-title">Готови ли сте за вашата проба?</h2>
          <p>Запазете своя частен час за лична проба на най-подходящия модел за вас. Нашите консултанти ще се свържат с вас за потвърждение.</p>
          <Link className="storefront-button storefront-button--light" href="#контакти">Запази час</Link>
        </div>
      </section>

      <section id="контакти" className="storefront-contact" aria-labelledby="contact-title">
        <div className="storefront-contact__copy">
          <p className="storefront-eyebrow">Контакти</p>
          <h2 id="contact-title">Свържете се с нас</h2>
          <dl>
            <ContactRow label="Адрес" value={storefrontContact.address} />
            <ContactRow label="Телефон" value={storefrontContact.phone} href={`tel:${storefrontContact.phone.replace(/\s/g, "")}`} />
            <ContactRow label="Електронна поща" value={storefrontContact.email} href={`mailto:${storefrontContact.email}`} />
            <ContactRow label="Работно време" value={storefrontContact.hours} />
          </dl>
          <a className="storefront-button storefront-button--dark" href={`mailto:${storefrontContact.email}`}>Изпратете ни съобщение</a>
        </div>
        <div className="storefront-contact__map">
          <iframe
            title="Карта до Бутик Емоция във Варна"
            src="https://www.google.com/maps?q=%D0%B3%D1%80.%20%D0%92%D0%B0%D1%80%D0%BD%D0%B0%2C%20%D0%B1%D1%83%D0%BB.%20%D0%92%D0%BB.%20%D0%92%D0%B0%D1%80%D0%BD%D0%B5%D0%BD%D1%87%D0%B8%D0%BA%2069&output=embed"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a href="https://maps.google.com/?q=Varna+Vladislav+Varnenchik+69" target="_blank" rel="noreferrer">
            Отвори в Google Maps
          </a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function CollectionCard({ image, title }: { image: string; title: string }) {
  return (
    <Link href="#нови-модели" className="storefront-category">
      <Image src={image} alt={title} fill sizes="(max-width: 768px) 100vw, 50vw" />
      <div className="storefront-category__gradient" />
      <div><h2>{title}</h2><p>Разгледай колекцията <span aria-hidden="true">→</span></p></div>
    </Link>
  );
}

function ContactRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return <div><dt>{label}</dt><dd>{href ? <a href={href}>{value}</a> : value}</dd></div>;
}

function SiteFooter() {
  return (
    <footer id="footer" className="storefront-footer">
      <div className="storefront-footer__brand">
        <StorefrontLogo inverted />
        <p>Роклята е повече от избор. Тя е усещането, с което започва вашият специален ден.</p>
        <div className="storefront-footer__socials">
          {socialLinks.map(({ label, icon: Icon }) => <a href={`https://${label.toLowerCase()}.com`} target="_blank" rel="noreferrer" aria-label={label} key={label}><Icon aria-hidden="true" /></a>)}
        </div>
      </div>
      <FooterLinks title="Колекции" links={["Нови постъпления", "Булчински рокли", "Вечерни рокли", "Аксесоари"]} />
      <FooterLinks title="Информация" links={["За нас", "Контакти", "Доставка и връщане", "Политика за поверителност"]} />
      <FooterLinks title="Следвайте ни" links={["Instagram", "Facebook", "Pinterest", "TikTok"]} />
      <div className="storefront-footer__bottom">© 2026 Бутик Емоция — Всички права запазени</div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: string[] }) {
  return <div className="storefront-footer__links"><h2>{title}</h2>{links.map(link => <a href={footerHref(link)} key={link}>{link}</a>)}</div>;
}

function footerHref(label: string) {
  if (label === "Контакти") return "#контакти";
  if (label === "За нас") return "#за-нас";
  if (["Instagram", "Facebook", "Pinterest", "TikTok"].includes(label)) return `https://${label.toLowerCase()}.com`;
  return "#нови-модели";
}
