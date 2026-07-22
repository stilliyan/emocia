"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { StorefrontLogo } from "./logo";
import { isPublicNavigationActive } from "./public-navigation";

type SiteHeaderProps = {
  variant?: "overlay" | "light";
};

const desktopNavigation = [
  { label: "Булчински рокли", href: "/bulchinski-rokli" },
  { label: "Официални рокли", href: "/oficialni-rokli" },
  { label: "Аксесоари", href: "/aksesoari" },
  { label: "Галерия", href: "/galeriya" },
  { label: "Съвети", href: "/blog" },
  { label: "Контакти", href: "/kontakti" },
] as const;

export function SiteHeader({ variant = "overlay" }: SiteHeaderProps) {
  const pathname = usePathname();
  const isLight = variant === "light";
  const [scrolled, setScrolled] = useState(false);
  const [mobileHidden, setMobileHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);
  const mobileMenuToggleRef = useRef<HTMLButtonElement>(null);
  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const lockedScrollY = window.scrollY;
    const previousBodyStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    const previousRootOverflow = document.documentElement.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobileMenu();
        mobileMenuToggleRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;

      const drawerFocusableElements = Array.from(
        mobileDrawerRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      const focusableElements = mobileMenuToggleRef.current
        ? [mobileMenuToggleRef.current, ...drawerFocusableElements]
        : drawerFocusableElements;
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements.at(-1);

      if (!firstFocusable || !lastFocusable) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.width = "100%";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyStyles.overflow;
      document.body.style.position = previousBodyStyles.position;
      document.body.style.top = previousBodyStyles.top;
      document.body.style.width = previousBodyStyles.width;
      document.documentElement.style.overflow = previousRootOverflow;
      window.scrollTo(0, lockedScrollY);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMobileMenu, mobileMenuOpen]);

  useEffect(() => {
    const contentSection = isLight
      ? null
      : document.querySelector<HTMLElement>(".storefront-content-stack");
    const productInfo = isLight
      ? document.querySelector<HTMLElement>(".storefront-product-info")
      : null;
    const mobileViewport = window.matchMedia("(max-width: 768px)");

    const updateHeader = () => {
      if (isLight) {
        if (!mobileViewport.matches || !productInfo) {
          setScrolled(window.scrollY > 1);
          return;
        }

        setScrolled(productInfo.getBoundingClientRect().top <= 152);
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

      closeMobileMenu();
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
  }, [closeMobileMenu]);

  return (
    <>
      <header className={`storefront-header${isLight ? " storefront-header--light" : ""}${scrolled ? " storefront-header--scrolled" : ""}${mobileHidden ? " storefront-header--mobile-hidden" : ""}${mobileMenuOpen ? " storefront-header--menu-open" : ""}`}>
        <StorefrontLogo inverted alternateSrc="/storefront/logo-dark.svg" />
        <nav aria-label="Основна навигация" className="storefront-header__desktop-nav">
          {desktopNavigation.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              aria-current={isPublicNavigationActive(pathname, href) ? "page" : undefined}
              className="storefront-header__nav-link"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="storefront-header__mobile-nav">
          <button
            ref={mobileMenuToggleRef}
            type="button"
            className="storefront-header__mobile-toggle"
            aria-label={mobileMenuOpen ? "Затвори меню" : "Отвори меню"}
            aria-expanded={mobileMenuOpen}
            aria-controls="storefront-mobile-menu"
            onClick={(event) => {
              setMobileMenuOpen((open) => !open);
              if (mobileMenuOpen && event.detail !== 0) {
                mobileMenuToggleRef.current?.blur();
              }
            }}
          >
            <span className="mobile-icon" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>

      <div
        id="storefront-mobile-menu"
        ref={mobileDrawerRef}
        className={`storefront storefront-mobile-drawer${mobileMenuOpen ? " storefront-mobile-drawer--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Мобилно меню"
        aria-hidden={!mobileMenuOpen}
        inert={!mobileMenuOpen}
        onPointerDown={(event) => {
          if (event.target !== event.currentTarget) return;
          closeMobileMenu();
          requestAnimationFrame(() => mobileMenuToggleRef.current?.focus());
        }}
      >
        <div className="storefront-mobile-drawer__panel">
          <nav aria-label="Мобилна навигация" className="storefront-mobile-drawer__links">
            {desktopNavigation.map(({ label, href }) => (
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

          <div className="storefront-mobile-drawer__footer">
            <Link
              href="/kontakti"
              className="storefront-button storefront-button--dark storefront-mobile-drawer__appointment"
              onClick={closeMobileMenu}
            >
              Запази час за проба
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
