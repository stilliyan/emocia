import Link from "next/link";
import { Menu } from "lucide-react";
import { StorefrontLogo } from "./logo";

const navigation = [
  ["Булчински рокли", "#колекции"],
  ["Вечерни рокли", "#колекции"],
  ["Аксесоари", "#нови-модели"],
  ["За нас", "#за-нас"],
] as const;

export function SiteHeader() {
  return (
    <header className="storefront-header">
      <StorefrontLogo inverted />
      <nav aria-label="Основна навигация" className="storefront-header__desktop-nav">
        {navigation.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}
        <Link className="storefront-header__contact" href="#контакти">Контакти</Link>
      </nav>
      <details className="storefront-header__mobile-nav">
        <summary aria-label="Отвори меню"><Menu aria-hidden="true" /></summary>
        <nav aria-label="Мобилна навигация">
          {navigation.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}
          <Link href="#контакти">Контакти</Link>
        </nav>
      </details>
    </header>
  );
}
