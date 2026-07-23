"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { HorizontalDragRail } from "./horizontal-drag-rail";

type PinnedHorizontalRailProps = {
  children: ReactNode;
  itemCount: number;
  title: string;
  titleId: string;
  ariaLabel: string;
};

const MINIMUM_PINNED_ITEMS = 4;
const MINIMUM_HORIZONTAL_DISTANCE = 160;
const KEYBOARD_SCROLL_STEP = 360;

export function PinnedHorizontalRail({
  children,
  itemCount,
  title,
  titleId,
  ariaLabel,
}: PinnedHorizontalRailProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const measurementFrameRef = useRef<number | null>(null);
  const horizontalDistanceRef = useRef(0);
  const isPinnedRef = useRef(false);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = section?.querySelector<HTMLElement>(".storefront-products__rail");
    if (!section || !viewport || !track) return;

    const pinMedia = window.matchMedia(
      "(min-width: 1025px) and (prefers-reduced-motion: no-preference)",
    );
    let disposed = false;

    const updateTrackPosition = () => {
      animationFrameRef.current = null;
      if (!isPinnedRef.current) return;

      const scrollRange = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(
        1,
        Math.max(0, -section.getBoundingClientRect().top / scrollRange),
      );
      track.style.transform = `translate3d(${-horizontalDistanceRef.current * progress}px, 0, 0)`;
    };

    const requestTrackUpdate = () => {
      if (animationFrameRef.current !== null) return;
      animationFrameRef.current = window.requestAnimationFrame(updateTrackPosition);
    };

    const measure = () => {
      if (disposed) return;

      if (measurementFrameRef.current !== null) {
        window.cancelAnimationFrame(measurementFrameRef.current);
      }

      measurementFrameRef.current = window.requestAnimationFrame(() => {
        measurementFrameRef.current = null;
        track.style.transform = "";
        section.style.removeProperty("height");

        const horizontalDistance = Math.max(
          0,
          track.scrollWidth - viewport.clientWidth,
        );
        const shouldPin =
          pinMedia.matches &&
          itemCount >= MINIMUM_PINNED_ITEMS &&
          horizontalDistance >= MINIMUM_HORIZONTAL_DISTANCE;

        section.dataset.pinned = String(shouldPin);
        isPinnedRef.current = shouldPin;
        horizontalDistanceRef.current = shouldPin ? horizontalDistance : 0;
        setIsPinned((current) => (current === shouldPin ? current : shouldPin));

        if (!shouldPin) return;

        const measuredDistance = Math.max(
          0,
          track.scrollWidth - viewport.clientWidth,
        );
        horizontalDistanceRef.current = measuredDistance;
        section.style.height = `${window.innerHeight + measuredDistance}px`;
        requestTrackUpdate();
      });
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(viewport);
    resizeObserver.observe(track);

    const images = Array.from(track.querySelectorAll("img"));
    images.forEach((image) => {
      if (!image.complete) image.addEventListener("load", measure);
    });

    window.addEventListener("scroll", requestTrackUpdate, { passive: true });
    window.addEventListener("resize", measure);
    pinMedia.addEventListener("change", measure);
    document.fonts.ready.then(measure).catch(() => undefined);
    measure();

    return () => {
      disposed = true;
      resizeObserver.disconnect();
      images.forEach((image) => image.removeEventListener("load", measure));
      window.removeEventListener("scroll", requestTrackUpdate);
      window.removeEventListener("resize", measure);
      pinMedia.removeEventListener("change", measure);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      if (measurementFrameRef.current !== null) {
        window.cancelAnimationFrame(measurementFrameRef.current);
      }
      track.style.transform = "";
      section.style.removeProperty("height");
      delete section.dataset.pinned;
    };
  }, [itemCount]);

  function handleKeyDownCapture(event: KeyboardEvent<HTMLElement>) {
    if (
      !isPinnedRef.current ||
      (event.key !== "ArrowLeft" && event.key !== "ArrowRight") ||
      !(event.target instanceof Element) ||
      !event.target.closest(".storefront-products__rail")
    ) {
      return;
    }

    const section = sectionRef.current;
    if (!section) return;

    event.preventDefault();
    event.stopPropagation();
    const sectionTop = window.scrollY + section.getBoundingClientRect().top;
    const currentSectionScroll = Math.min(
      horizontalDistanceRef.current,
      Math.max(0, window.scrollY - sectionTop),
    );
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextSectionScroll = Math.min(
      horizontalDistanceRef.current,
      Math.max(0, currentSectionScroll + direction * KEYBOARD_SCROLL_STEP),
    );

    window.scrollTo({
      top: sectionTop + nextSectionScroll,
      behavior: "smooth",
    });
  }

  return (
    <section
      ref={sectionRef}
      id="нови-модели"
      className="storefront-products storefront-products--mixed"
      aria-labelledby={titleId}
      data-pinned="false"
      onKeyDownCapture={handleKeyDownCapture}
    >
      <div className="storefront-products__sticky">
        <h2 id={titleId}>{title}</h2>
        <div ref={viewportRef} className="storefront-products__viewport">
          <HorizontalDragRail
            className="storefront-products__rail"
            ariaLabel={ariaLabel}
            keyboardStep={KEYBOARD_SCROLL_STEP}
            mouseDragEnabled={!isPinned}
          >
            {children}
          </HorizontalDragRail>
        </div>
      </div>
    </section>
  );
}
