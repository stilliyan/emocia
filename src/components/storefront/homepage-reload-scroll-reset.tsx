"use client";

import { useLayoutEffect, useRef } from "react";

export function shouldResetHomepageScroll(
  navigationType: string | undefined,
  hasHash: boolean,
) {
  return navigationType === "reload" && !hasHash;
}

/** Resets only a document reload of the homepage, without altering history navigation. */
export function HomepageReloadScrollReset() {
  const handledReloadRef = useRef(false);

  useLayoutEffect(() => {
    const navigationEntry = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming | undefined;

    if (
      handledReloadRef.current ||
      !shouldResetHomepageScroll(navigationEntry?.type, Boolean(window.location.hash))
    ) {
      return;
    }

    handledReloadRef.current = true;

    const previousScrollRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";

    try {
      window.scrollTo(0, 0);
    } finally {
      history.scrollRestoration = previousScrollRestoration;
    }
  }, []);

  return null;
}
