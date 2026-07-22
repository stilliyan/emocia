"use client";

import Image from "next/image";
import * as React from "react";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

export interface ScrollReelTestimonial {
  quote: string;
  author: string;
  image: string;
  alt?: string;
}

interface ScrollReelTestimonialsProps {
  testimonials: ScrollReelTestimonial[];
  charStaggerMs?: number;
  className?: string;
}

const EXIT_MS = 240;
const SLIDE_MS = 800;
const AUTOPLAY_MS = 6000;
const CELL = 190;
const GAP = 12;
const STEP = 3 * (CELL + GAP);
const EASE_IN_OUT = "cubic-bezier(.65,0,.35,1)";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function MosaicCell() {
  return <div aria-hidden="true" className="storefront-testimonial-reel__mosaic-cell" />;
}

function MosaicImage({ src, alt }: { src: string; alt?: string }) {
  return (
    <div className="storefront-testimonial-reel__mosaic-image">
      <Image src={src} alt={alt ?? ""} fill sizes="190px" />
    </div>
  );
}

function Chars({ text, startIndex, staggerMs }: { text: string; startIndex: number; staggerMs: number }) {
  const words = text.split(" ");

  return (
    <>
      {words.map((word, wordIndex) => {
        const precedingCharacters = words
          .slice(0, wordIndex)
          .reduce((total, precedingWord) => total + precedingWord.length + 1, 0);
        const wordStartIndex = startIndex + precedingCharacters;
        const wordSpan = (
          <span className="inline-block whitespace-nowrap">
            {Array.from(word).map((character, characterIndex) => {
              const delay = (wordStartIndex + characterIndex) * staggerMs;
              return (
                <span
                  key={`${character}-${characterIndex}`}
                  className="scroll-reel-char"
                  style={{ animationDelay: `${delay}ms` }}
                >
                  {character}
                </span>
              );
            })}
          </span>
        );

        return (
          <React.Fragment key={`${word}-${wordIndex}`}>
            {wordSpan}
            {wordIndex < words.length - 1 ? " " : null}
          </React.Fragment>
        );
      })}
    </>
  );
}

export function ScrollReelTestimonials({
  testimonials,
  charStaggerMs = 6,
  className,
}: ScrollReelTestimonialsProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [displayIndex, setDisplayIndex] = React.useState(0);
  const [exiting, setExiting] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const animating = React.useRef(false);
  const autoplayDirection = React.useRef<1 | -1>(1);
  const timeouts = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const count = testimonials.length;

  React.useEffect(() => {
    const timeoutIds = timeouts.current;
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setMounted(true)));
    return () => {
      cancelAnimationFrame(frame);
      timeoutIds.forEach(clearTimeout);
    };
  }, []);

  const transitionTo = React.useCallback(
    (next: number) => {
      if (animating.current || next < 0 || next >= count || next === index) return;

      if (prefersReducedMotion) {
        timeouts.current.forEach(clearTimeout);
        timeouts.current = [];
        animating.current = false;
        setIndex(next);
        setDisplayIndex(next);
        setExiting(false);
        return;
      }

      animating.current = true;
      setIndex(next);
      setExiting(true);
      timeouts.current.push(
        setTimeout(() => {
          setDisplayIndex(next);
          setExiting(false);
        }, EXIT_MS),
      );
      timeouts.current.push(
        setTimeout(() => {
          animating.current = false;
        }, SLIDE_MS),
      );
    },
    [count, index, prefersReducedMotion],
  );

  const paginate = React.useCallback(
    (direction: 1 | -1) => {
      autoplayDirection.current = direction;
      transitionTo(index + direction);
    },
    [index, transitionTo],
  );

  React.useEffect(() => {
    if (paused || count < 2 || prefersReducedMotion) return;

    const timer = window.setTimeout(() => {
      let next = index + autoplayDirection.current;

      if (next < 0 || next >= count) {
        autoplayDirection.current = autoplayDirection.current === 1 ? -1 : 1;
        next = index + autoplayDirection.current;
      }

      transitionTo(next);
    }, AUTOPLAY_MS);

    return () => window.clearTimeout(timer);
  }, [count, index, paused, prefersReducedMotion, transitionTo]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      paginate(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      paginate(-1);
    }
  };

  const middleItems = React.useMemo(() => {
    const items: Array<{ type: "cell" } | { type: "image"; index: number }> = [];

    for (let item = 0; item < 3; item += 1) items.push({ type: "cell" });
    testimonials.forEach((_, testimonialIndex) => {
      items.push({ type: "image", index: testimonialIndex });
      if (testimonialIndex < count - 1) items.push({ type: "cell" }, { type: "cell" });
    });
    for (let item = 0; item < 3; item += 1) items.push({ type: "cell" });

    return items;
  }, [count, testimonials]);

  if (!count) return null;

  const sideCellCount = middleItems.length;
  const middleY = ((count - 1) / 2 - index) * STEP;
  const sideY = -middleY;
  const activeDisplayIndex = prefersReducedMotion ? index : displayIndex;
  const current = testimonials[activeDisplayIndex] ?? testimonials[0];
  const columnStyle = (y: number): React.CSSProperties => ({
    transform: `translateY(${y}px)`,
    transition: mounted && !prefersReducedMotion ? `transform ${SLIDE_MS}ms ${EASE_IN_OUT}` : "none",
  });

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Отзиви от клиенти"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      className={cn("storefront-testimonial-reel", className)}
    >
      <div className="storefront-testimonial-reel__visual">
        <div className="storefront-testimonial-reel__mosaic" aria-hidden="true">
          {[sideY, middleY, sideY].map((offset, columnIndex) => (
            <div
              key={columnIndex}
              className="storefront-testimonial-reel__mosaic-column"
              style={columnStyle(offset)}
            >
              {columnIndex === 1
                ? middleItems.map((item, itemIndex) =>
                    item.type === "image" ? (
                      <MosaicImage
                        key={`${item.type}-${itemIndex}`}
                        src={testimonials[item.index].image}
                        alt={testimonials[item.index].alt}
                      />
                    ) : (
                      <MosaicCell key={`${item.type}-${itemIndex}`} />
                    ),
                  )
                : Array.from({ length: sideCellCount }).map((_, itemIndex) => (
                    <MosaicCell key={itemIndex} />
                  ))}
            </div>
          ))}
        </div>
      </div>

      <div className="storefront-testimonial-reel__copy">
        <div className="storefront-testimonial-reel__message">
          <svg className="storefront-testimonial-reel__quote-mark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M4.58 17.32C3.55 16.23 3 15 3 13.01c0-3.5 2.46-6.64 6.03-8.19l.9 1.38c-3.34 1.8-4 4.15-4.25 5.62.54-.28 1.24-.38 1.93-.31 1.8.17 3.23 1.65 3.23 3.49a3.5 3.5 0 0 1-3.5 3.5c-1.07 0-2.1-.49-2.75-1.18zm10 0C13.55 16.23 13 15 13 13.01c0-3.5 2.46-6.64 6.03-8.19l.9 1.38c-3.34 1.8-4 4.15-4.25 5.62.54-.28 1.24-.38 1.93-.31 1.8.17 3.23 1.65 3.23 3.49a3.5 3.5 0 0 1-3.5 3.5c-1.07 0-2.1-.49-2.75-1.18z" />
          </svg>

          <div className="storefront-testimonial-reel__live" aria-live={paused ? "polite" : "off"}>
            <div aria-hidden="true" className="storefront-testimonial-reel__measure">
              <p className="storefront-testimonial-reel__quote">{current.quote}</p>
              <p className="storefront-testimonial-reel__author">{current.author}</p>
            </div>
            <div
              key={activeDisplayIndex}
              className={cn("storefront-testimonial-reel__animated-copy", exiting && !prefersReducedMotion && "scroll-reel-exit")}
            >
              <p className="storefront-testimonial-reel__quote">
                {prefersReducedMotion
                  ? current.quote
                  : <Chars text={current.quote} startIndex={0} staggerMs={charStaggerMs} />}
              </p>
              <p className="storefront-testimonial-reel__author">
                {prefersReducedMotion
                  ? current.author
                  : <Chars text={current.author} startIndex={current.quote.length + 6} staggerMs={charStaggerMs} />}
              </p>
            </div>
          </div>
        </div>

        <div className="storefront-testimonial-reel__controls">
          <ReelButton direction="previous" disabled={index === 0} onClick={() => paginate(-1)} />
          <ReelButton direction="next" disabled={index === count - 1} onClick={() => paginate(1)} />
        </div>
      </div>
    </div>
  );
}

function ReelButton({ direction, disabled, onClick }: { direction: "previous" | "next"; disabled: boolean; onClick: () => void }) {
  const previous = direction === "previous";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={previous ? "Предишен отзив" : "Следващ отзив"}
      className="storefront-testimonial-reel__button"
    >
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={previous ? "M7.5 2.5 3.5 6l4 3.5" : "m4.5 2.5 4 3.5-4 3.5"} />
      </svg>
    </button>
  );
}
