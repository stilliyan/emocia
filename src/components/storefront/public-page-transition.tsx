"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "./public-page-transition.css";

const wipeDuration = 500;
const fadeDuration = 300;

type TransitionPhase = "entering" | "leaving" | "idle";

const storefrontRevealSelector = [
  ".storefront-categories > .storefront-category",
  ".storefront-feature > *",
  ".storefront-products",
  ".storefront-about > *",
  ".storefront-testimonial",
  ".storefront-appointment",
  ".storefront-contact > *",
  ".storefront-collections-index__intro",
  ".storefront-collections-index__grid > *",
  ".storefront-collections-index__appointment",
  ".storefront-collection-catalogue .storefront-collection-card-link",
  ".storefront-gallery-grid > *",
  ".storefront-gallery-note",
  ".storefront-contact-page__lead",
  ".storefront-blog-index__header > *",
  ".storefront-blog-featured",
  ".storefront-blog-grid > *",
  ".storefront-article-section",
  ".storefront-article-recommendations__grid > *",
  ".storefront-legal section",
].join(",");

export function PublicPageTransition() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<TransitionPhase>("entering");
  const navigationStartedAt = useRef<number | null>(null);
  const previousPathname = useRef<string | null>(null);
  const phaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPublicStorefront = pathname !== "/login" && !pathname.startsWith("/admin");

  useEffect(() => {
    if (!isPublicStorefront) return;

    const clearPhaseTimer = () => {
      if (phaseTimer.current) {
        clearTimeout(phaseTimer.current);
        phaseTimer.current = null;
      }
    };

    const beginTransition = () => {
      clearPhaseTimer();
      navigationStartedAt.current = performance.now();
      setPhase("entering");
    };

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (
        !link ||
        link.hasAttribute("download") ||
        (link.target && link.target !== "_self")
      ) {
        return;
      }

      const destination = new URL(link.href, window.location.href);
      const isInternal = destination.origin === window.location.origin;
      const isSamePath = destination.pathname === window.location.pathname;
      const isSamePageAnchor = isSamePath && destination.hash !== window.location.hash;
      const isInternalRoute =
        destination.pathname !== "/login" &&
        !destination.pathname.startsWith("/admin");

      if (!isInternal || !isInternalRoute || isSamePath || isSamePageAnchor) return;

      beginTransition();
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) beginTransition();
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", beginTransition);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      clearPhaseTimer();
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", beginTransition);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [isPublicStorefront]);

  useEffect(() => {
    if (!isPublicStorefront) return;

    const now = performance.now();
    const isInitialLoad = previousPathname.current === null;
    const routeChanged =
      previousPathname.current !== null && previousPathname.current !== pathname;

    previousPathname.current = pathname;

    if (!isInitialLoad && !routeChanged) return;

    if (navigationStartedAt.current === null) {
      navigationStartedAt.current = now;
      setPhase("entering");
    }

    const elapsed = now - navigationStartedAt.current;
    const remainingWipe = Math.max(0, wipeDuration - elapsed);

    if (phaseTimer.current) clearTimeout(phaseTimer.current);
    phaseTimer.current = setTimeout(() => {
      setPhase("leaving");
      phaseTimer.current = setTimeout(() => {
        setPhase("idle");
        navigationStartedAt.current = null;
        phaseTimer.current = null;
      }, fadeDuration);
    }, remainingWipe);

    return () => {
      if (phaseTimer.current) {
        clearTimeout(phaseTimer.current);
        phaseTimer.current = null;
      }
    };
  }, [isPublicStorefront, pathname]);

  useEffect(() => {
    if (!isPublicStorefront) return;

    const motionPreference = window.matchMedia(
      "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
    );
    let stopObserving = () => {};

    const syncRevealMotion = () => {
      stopObserving();
      stopObserving = () => {};

      if (!motionPreference.matches) return;

      const registeredElements = new Set<HTMLElement>();
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.remove("storefront-scroll-trigger--offscreen");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -50px 0px", threshold: 0 },
      );

      const registerElement = (element: HTMLElement) => {
        if (registeredElements.has(element)) return;

        const siblings = element.parentElement
          ? Array.from(element.parentElement.children).filter(
              (sibling): sibling is HTMLElement =>
                sibling instanceof HTMLElement && sibling.matches(storefrontRevealSelector),
            )
          : [];
        const siblingIndex = Math.max(0, siblings.indexOf(element));

        element.style.setProperty(
          "--storefront-reveal-order",
          String(Math.min(siblingIndex, 4)),
        );
        element.classList.add(
          "storefront-scroll-trigger",
          "storefront-scroll-trigger--offscreen",
        );
        registeredElements.add(element);
        observer.observe(element);
      };

      const registerTree = (root: ParentNode) => {
        if (root instanceof HTMLElement && root.matches(storefrontRevealSelector)) {
          registerElement(root);
        }

        root
          .querySelectorAll<HTMLElement>(storefrontRevealSelector)
          .forEach(registerElement);
      };

      registerTree(document.body);

      const mutationObserver = new MutationObserver((records) => {
        records.forEach((record) => {
          record.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) registerTree(node);
          });
        });
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });

      stopObserving = () => {
        mutationObserver.disconnect();
        observer.disconnect();
        registeredElements.forEach((element) => {
          element.classList.remove(
            "storefront-scroll-trigger",
            "storefront-scroll-trigger--offscreen",
          );
          element.style.removeProperty("--storefront-reveal-order");
        });
        registeredElements.clear();
      };
    };

    syncRevealMotion();
    motionPreference.addEventListener("change", syncRevealMotion);

    return () => {
      motionPreference.removeEventListener("change", syncRevealMotion);
      stopObserving();
    };
  }, [isPublicStorefront, pathname]);

  if (!isPublicStorefront) {
    return null;
  }

  return (
    <div
      className={`storefront-page-transition storefront-page-transition--${phase}`}
      aria-hidden="true"
    />
  );
}
