"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StorefrontLogo } from "./logo";

const navigation = [
  ["Булчински рокли", "#колекции"],
  ["Вечерни рокли", "#колекции"],
  ["Аксесоари", "#нови-модели"],
  ["За нас", "#за-нас"],
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const contentSection = document.querySelector<HTMLElement>(".storefront-content-stack");

    const updateHeader = () => {
      const contentTop = contentSection?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
      setScrolled(contentTop <= 144);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    window.addEventListener("resize", updateHeader);

    return () => {
      window.removeEventListener("scroll", updateHeader);
      window.removeEventListener("resize", updateHeader);
    };
  }, []);

  return (
    <header className={`storefront-header${scrolled ? " storefront-header--scrolled" : ""}`}>
      <StorefrontLogo inverted alternateSrc="/storefront/logo-dark.svg" />
      <nav aria-label="Основна навигация" className="storefront-header__desktop-nav">
        {navigation.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}
        <Link className="storefront-header__contact" href="#контакти">Контакти</Link>
      </nav>
      <details className="storefront-header__mobile-nav">
        <summary aria-label="Отвори или затвори меню">
          <svg
            className="mobile-icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <rect x="2" y="7.25" width="20" height="1.5" rx="0.75" />
            <rect x="2" y="15.25" width="20" height="1.5" rx="0.75" />
          </svg>
        </summary>
        <nav aria-label="Мобилна навигация">
          {navigation.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}
          <Link href="#контакти">Контакти</Link>
        </nav>
      </details>
    </header>
  );
}
