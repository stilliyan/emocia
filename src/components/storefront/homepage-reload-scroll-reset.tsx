"use client";

import { useLayoutEffect } from "react";

export function shouldResetHomepageScroll(
  navigationType: string | undefined,
  hasHash: boolean,
) {
  return navigationType === "reload" && !hasHash;
}

export function shouldResetHomepageScrollOnPageShow(
  navigationType: string | undefined,
  persisted: boolean,
  hasHash: boolean,
) {
  return !hasHash && !persisted && navigationType !== "back_forward";
}

function getNavigationType() {
  const navigationEntry = performance.getEntriesByType(
    "navigation",
  )[0] as PerformanceNavigationTiming | undefined;

  return navigationEntry?.type;
}

function scrollToHomepageTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

/** Resets document reloads and restored homepage documents without changing route navigation. */
export function HomepageReloadScrollReset() {
  useLayoutEffect(() => {
    const previousScrollRestoration = history.scrollRestoration;
    let usesManualScrollRestoration = false;
    let firstFrame = 0;
    let secondFrame = 0;

    const resetAfterSafariRestoration = () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);

      scrollToHomepageTop();
      firstFrame = requestAnimationFrame(() => {
        scrollToHomepageTop();
        secondFrame = requestAnimationFrame(scrollToHomepageTop);
      });
    };

    const resetHomepage = () => {
      history.scrollRestoration = "manual";
      usesManualScrollRestoration = true;
      resetAfterSafariRestoration();
    };

    if (shouldResetHomepageScroll(getNavigationType(), Boolean(window.location.hash))) {
      resetHomepage();
    }

    const handlePageShow = (event: PageTransitionEvent) => {
      if (
        shouldResetHomepageScrollOnPageShow(
          getNavigationType(),
          event.persisted,
          Boolean(window.location.hash),
        )
      ) {
        resetHomepage();
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      window.removeEventListener("pageshow", handlePageShow);

      if (usesManualScrollRestoration) {
        history.scrollRestoration = previousScrollRestoration;
      }
    };
  }, []);

  return null;
}
