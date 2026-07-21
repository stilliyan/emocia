import Image from "next/image";
import Link from "next/link";
import { StorefrontLogo } from "./logo";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "./social-icons";
import { publicNavigation } from "./public-navigation";

const socialLinks = [
  { label: "TikTok", href: "https://tiktok.com", icon: TikTokIcon },
  { label: "Facebook", href: "https://facebook.com", icon: FacebookIcon },
  { label: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
] as const;

const primaryLinks = publicNavigation.slice(0, 4);
const secondaryLinks = publicNavigation.slice(4);

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
      <FooterLinks title="Навигация" links={primaryLinks} />
      <FooterLinks title="Още" links={secondaryLinks} />
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
}: {
  title: string;
  links: ReadonlyArray<{ readonly label: string; readonly href: string }>;
}) {
  return (
    <div className="storefront-footer__links">
      <h2>{title}</h2>
      {links.map(({ label, href }) => <Link href={href} key={href}>{label}</Link>)}
    </div>
  );
}
