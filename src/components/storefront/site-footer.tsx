import Image from "next/image";
import Link from "next/link";
import { StorefrontLogo } from "./logo";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "./social-icons";
import { publicNavigation } from "./public-navigation";

const socialLinks = [
  { label: "TikTok", href: "https://www.tiktok.com/@emocia_butik", icon: TikTokIcon },
  {
    label: "Facebook",
    href: "https://www.facebook.com/p/%D0%91%D1%83%D1%82%D0%B8%D0%BA-%D0%95%D0%BC%D0%BE%D1%86%D0%B8%D1%8F-100021298455926/?locale=bg_BG",
    icon: FacebookIcon,
  },
  { label: "Instagram", href: "https://www.instagram.com/butik.emocia/", icon: InstagramIcon },
] as const;

const primaryLinks = publicNavigation.slice(0, 4);
const secondaryLinks = publicNavigation.slice(4);
const legalLinks = [
  { label: "Поверителност", href: "/politika-za-poveritelnost" },
  { label: "Бисквитки", href: "/politika-za-biskvitkite" },
  { label: "Условия за използване", href: "/usloviya-za-izpolzvane" },
] as const;

export function SiteFooter() {
  return (
    <footer id="footer" className="storefront-footer">
      <Image
        src="/storefront/footer-bride.svg"
        alt=""
        width={1704}
        height={512}
        sizes="100vw"
        className="storefront-footer__bride"
        aria-hidden="true"
      />
      <div className="storefront-footer__brand">
        <StorefrontLogo inverted />
        <p>Роклята е повече от избор. Тя е усещането, с което започва вашият специален ден.</p>
        <div className="storefront-footer__socials">
          {socialLinks.map(({ label, href, icon: Icon }) => (
            <a href={href} target="_blank" rel="noreferrer" aria-label={label} key={label}>
              <Icon aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
      <div className="storefront-footer__nav-groups">
        <FooterLinks title="Навигация" links={primaryLinks} />
        <FooterLinks title="Още" links={secondaryLinks} />
        <FooterLinks title="Правна информация" links={legalLinks} className="storefront-footer__links--legal" />
      </div>
      <div className="storefront-footer__bottom">
        <span>© 2026 Бутик Емоция — Всички права запазени</span>
        <span className="storefront-footer__credit">Made with <span>♥</span> by Stiliyan S.</span>
      </div>
    </footer>
  );
}

function FooterLinks({
  title,
  links,
  className,
}: {
  title: string;
  links: ReadonlyArray<{ readonly label: string; readonly href: string }>;
  className?: string;
}) {
  return (
    <div className={`storefront-footer__links${className ? ` ${className}` : ""}`}>
      <h2>{title}</h2>
      {links.map(({ label, href }) => <Link href={href} key={href}>{label}</Link>)}
    </div>
  );
}
