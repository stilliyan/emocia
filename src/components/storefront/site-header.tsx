"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { StorefrontLogo } from "./logo";
import { isPublicNavigationActive, publicNavigation } from "./public-navigation";

type SiteHeaderProps = {
  variant?: "overlay" | "light";
};

export function SiteHeader({ variant = "overlay" }: SiteHeaderProps) {
  const pathname = usePathname();
  const isLight = variant === "light";
  const [scrolled, setScrolled] = useState(false);
  const [mobileHidden, setMobileHidden] = useState(false);
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);
  const closeMobileMenu = () => mobileMenuRef.current?.removeAttribute("open");

  useEffect(() => {
    const contentSection = isLight
      ? null
      : document.querySelector<HTMLElement>(".storefront-content-stack");

    const updateHeader = () => {
      if (isLight) {
        setScrolled(window.scrollY > 1);
        return;
      }

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
  }, [isLight]);

  useEffect(() => {
    const footer = document.getElementById("footer");
    const mobileViewport = window.matchMedia("(max-width: 768px)");

    if (!footer) return;

    let footerVisible = false;
    let lastScrollY = window.scrollY;

    const hideAtFooter = () => {
      if (!mobileViewport.matches) return;

      mobileMenuRef.current?.removeAttribute("open");
      setMobileHidden(true);
    };

    const observer = new IntersectionObserver(([entry]) => {
      footerVisible = entry.isIntersecting;

      if (footerVisible) {
        hideAtFooter();
      } else {
        setMobileHidden(false);
      }
    });

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;

      if (!mobileViewport.matches) {
        setMobileHidden(false);
      } else if (delta < -4) {
        setMobileHidden(false);
      } else if (delta > 4 && footerVisible) {
        hideAtFooter();
      }

      lastScrollY = currentScrollY;
    };

    const handleViewportChange = () => {
      lastScrollY = window.scrollY;

      if (!mobileViewport.matches) {
        setMobileHidden(false);
      }
    };

    observer.observe(footer);
    window.addEventListener("scroll", handleScroll, { passive: true });
    mobileViewport.addEventListener("change", handleViewportChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      mobileViewport.removeEventListener("change", handleViewportChange);
    };
  }, []);

  return (
    <header className={`storefront-header${isLight ? " storefront-header--light" : ""}${scrolled ? " storefront-header--scrolled" : ""}${mobileHidden ? " storefront-header--mobile-hidden" : ""}`}>
      <StorefrontLogo inverted alternateSrc="/storefront/logo-dark.svg" />
      <nav aria-label="Основна навигация" className="storefront-header__desktop-nav">
        {publicNavigation.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            aria-current={isPublicNavigationActive(pathname, href) ? "page" : undefined}
            className={href === "/kontakti" ? "storefront-header__contact" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      <details ref={mobileMenuRef} className="storefront-header__mobile-nav">
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
          {publicNavigation.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              aria-current={isPublicNavigationActive(pathname, href) ? "page" : undefined}
              onClick={closeMobileMenu}
            >
              {label}
            </Link>
          ))}
        </nav>
      </details>
    </header>
  );
}
