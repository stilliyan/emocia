"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type MouseEvent, useCallback, useEffect, useRef, useState, useTransition } from "react";
import { AppointmentDialog } from "./appointment-dialog";
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
  const router = useRouter();
  const isLight = variant === "light";
  const [scrolled, setScrolled] = useState(false);
  const [mobileHidden, setMobileHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileBookingOpen, setMobileBookingOpen] = useState(false);
  const [mobileMenuPathname, setMobileMenuPathname] = useState(pathname);
  const [navigatingHref, setNavigatingHref] = useState<string | null>(null);
  const [navigationPending, startNavigation] = useTransition();
  const mobileMenuVisible = mobileMenuOpen && mobileMenuPathname === pathname;
  const activeNavigatingHref = mobileMenuVisible ? navigatingHref : null;
  const mobileDrawerRef = useRef<HTMLDivElement>(null);
  const mobileMenuToggleRef = useRef<HTMLButtonElement>(null);
  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
    setNavigatingHref(null);
  }, []);

  const navigateFromMobileMenu = useCallback((event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    if (navigatingHref) return;

    if (isPublicNavigationActive(pathname, href)) {
      closeMobileMenu();
      return;
    }

    setNavigatingHref(href);
    startNavigation(() => router.push(href, { scroll: true }));
  }, [closeMobileMenu, navigatingHref, pathname, router]);

  useEffect(() => {
    if (!navigatingHref) return;

    const navigationFallback = window.setTimeout(() => setNavigatingHref(null), 10_000);
    return () => window.clearTimeout(navigationFallback);
  }, [navigatingHref]);

  useEffect(() => {
    if (!mobileMenuVisible) return;

    const lockedScrollY = window.scrollY;
    const lockedPathname = window.location.pathname;
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
      if (window.location.pathname === lockedPathname) {
        window.scrollTo(0, lockedScrollY);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMobileMenu, mobileMenuVisible]);

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
      <header className={`storefront-header${isLight ? " storefront-header--light" : ""}${scrolled ? " storefront-header--scrolled" : ""}${mobileHidden ? " storefront-header--mobile-hidden" : ""}${mobileMenuVisible ? " storefront-header--menu-open" : ""}`}>
        <StorefrontLogo inverted alternateSrc="/storefront/logo-dark.svg" />
        <nav aria-label="Основна навигация" className="storefront-header__desktop-nav">
          {desktopNavigation.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              aria-current={isPublicNavigationActive(pathname, href) ? "page" : undefined}
              className="storefront-header__nav-link"
            >
              <span className="storefront-header__nav-label">{label}</span>
            </Link>
          ))}
        </nav>
        <div className="storefront-header__mobile-nav">
          <button
            ref={mobileMenuToggleRef}
            type="button"
            className="storefront-header__mobile-toggle"
            aria-label={mobileMenuVisible ? "Затвори меню" : "Отвори меню"}
            aria-expanded={mobileMenuVisible}
            aria-controls="storefront-mobile-menu"
            onClick={(event) => {
              if (mobileMenuVisible) {
                closeMobileMenu();
              } else {
                setMobileMenuPathname(pathname);
                setNavigatingHref(null);
                setMobileMenuOpen(true);
              }
              if (mobileMenuVisible && event.detail !== 0) {
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
        className={`storefront storefront-mobile-drawer${mobileMenuVisible ? " storefront-mobile-drawer--open" : ""}${activeNavigatingHref ? " storefront-mobile-drawer--navigating" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Мобилно меню"
        aria-busy={Boolean(activeNavigatingHref) || navigationPending}
        aria-hidden={!mobileMenuVisible}
        inert={!mobileMenuVisible}
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
                data-navigation-target={activeNavigatingHref === href ? "true" : undefined}
                onClick={(event) => navigateFromMobileMenu(event, href)}
              >
                <span className="storefront-mobile-drawer__link-label">{label}</span>
              </Link>
            ))}
          </nav>

          <div className="storefront-mobile-drawer__footer">
            <AppointmentDialog
              source="other"
              className="storefront-button storefront-button--dark storefront-mobile-drawer__appointment"
              open={mobileBookingOpen}
              onOpenChange={(next) => {
                setMobileBookingOpen(next);
                if (next) closeMobileMenu();
                else requestAnimationFrame(() => mobileMenuToggleRef.current?.focus());
              }}
            >
              Запази час за проба
            </AppointmentDialog>
          </div>

          <span className="sr-only" aria-live="polite">
            {activeNavigatingHref ? "Зареждаме избраната страница." : ""}
          </span>
        </div>
      </div>
    </>
  );
}
