"use client";

import Image from "next/image";
import * as React from "react";

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

const CELL = 146;
const GAP = 10;
const STEP = 3 * (CELL + GAP);
const EXIT_MS = 240;
const SLIDE_MS = 800;
const AUTOPLAY_MS = 6000;
const EASE_IN_OUT = "cubic-bezier(0.65,0,0.35,1)";
const FEATURED_SHADOW =
  "0 1px 1px rgba(0,0,0,.18), 0 7px 5px -2px rgba(0,0,0,.16), 0 19px 13px -3px rgba(0,0,0,.13), 0 33px 23px -4px rgba(0,0,0,.09), inset 0 1px 0 rgba(255,255,255,.7)";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Cell() {
  return (
    <div
      aria-hidden="true"
      className="shrink-0 rounded-xl border border-border bg-linear-to-b from-secondary to-card blur-[1px] shadow-[0_1px_2px_rgba(0,0,0,.05),inset_0_2px_0_rgba(255,255,255,1)]"
      style={{ width: CELL, height: CELL }}
    />
  );
}

function Featured({ src, alt }: { src: string; alt?: string }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl bg-muted"
      style={{ width: CELL, height: CELL, boxShadow: FEATURED_SHADOW }}
    >
      <Image src={src} alt={alt ?? ""} fill sizes="146px" className="object-cover object-[center_30%]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-2 bg-white/80 mix-blend-saturation" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-3 bg-[linear-gradient(221deg,transparent_32%,rgba(236,109,163,.32)_45%,rgba(130,189,237,.18)_54%,transparent_65%)] blur-[6px] mix-blend-overlay"
      />
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
    [count, index],
  );

  const paginate = React.useCallback(
    (direction: 1 | -1) => {
      autoplayDirection.current = direction;
      transitionTo(index + direction);
    },
    [index, transitionTo],
  );

  React.useEffect(() => {
    if (paused || count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setTimeout(() => {
      let next = index + autoplayDirection.current;

      if (next < 0 || next >= count) {
        autoplayDirection.current = autoplayDirection.current === 1 ? -1 : 1;
        next = index + autoplayDirection.current;
      }

      transitionTo(next);
    }, AUTOPLAY_MS);

    return () => window.clearTimeout(timer);
  }, [count, index, paused, transitionTo]);

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
    const items: Array<{ type: "cell" } | { type: "featured"; index: number }> = [];
    for (let item = 0; item < 3; item += 1) items.push({ type: "cell" });
    testimonials.forEach((_, testimonialIndex) => {
      items.push({ type: "featured", index: testimonialIndex });
      if (testimonialIndex < count - 1) items.push({ type: "cell" }, { type: "cell" });
    });
    for (let item = 0; item < 3; item += 1) items.push({ type: "cell" });
    return items;
  }, [count, testimonials]);

  if (!count) return null;

  const sideCellCount = 4 + 2 * count;
  const middleY = ((count - 1) / 2 - index) * STEP;
  const sideY = -middleY;
  const current = testimonials[displayIndex] ?? testimonials[0];
  const columnStyle = (y: number): React.CSSProperties => ({
    transform: `translateY(${y}px)`,
    transition: mounted ? `transform ${SLIDE_MS}ms ${EASE_IN_OUT}` : "none",
  });

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Отзиви от клиенти"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      className={cn(
        "relative flex w-full flex-col items-stretch overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring/30 md:min-h-[430px] md:flex-row",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="relative h-72 w-full shrink-0 self-stretch overflow-hidden md:h-auto md:w-[46%]"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center gap-2.5">
          {[sideY, middleY, sideY].map((offset, columnIndex) => (
            <div
              key={columnIndex}
              className="flex shrink-0 flex-col gap-2.5 will-change-transform motion-reduce:transition-none"
              style={columnStyle(offset)}
            >
              {columnIndex === 1
                ? middleItems.map((item, itemIndex) =>
                    item.type === "featured" ? (
                      <Featured
                        key={`${item.type}-${itemIndex}`}
                        src={testimonials[item.index].image}
                        alt={testimonials[item.index].alt}
                      />
                    ) : (
                      <Cell key={`${item.type}-${itemIndex}`} />
                    ),
                  )
                : Array.from({ length: sideCellCount }).map((_, itemIndex) => <Cell key={itemIndex} />)}
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch px-6 py-9 md:px-14 md:py-14 lg:px-20">
        <div className="flex flex-col gap-3">
          <svg className="block h-11 w-11 text-muted-foreground/35" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M4.58 17.32C3.55 16.23 3 15 3 13.01c0-3.5 2.46-6.64 6.03-8.19l.9 1.38c-3.34 1.8-4 4.15-4.25 5.62.54-.28 1.24-.38 1.93-.31 1.8.17 3.23 1.65 3.23 3.49a3.5 3.5 0 0 1-3.5 3.5c-1.07 0-2.1-.49-2.75-1.18zm10 0C13.55 16.23 13 15 13 13.01c0-3.5 2.46-6.64 6.03-8.19l.9 1.38c-3.34 1.8-4 4.15-4.25 5.62.54-.28 1.24-.38 1.93-.31 1.8.17 3.23 1.65 3.23 3.49a3.5 3.5 0 0 1-3.5 3.5c-1.07 0-2.1-.49-2.75-1.18z" />
          </svg>

          <div className="relative w-full max-w-[560px] overflow-hidden" aria-live={paused ? "polite" : "off"}>
            <div aria-hidden="true" className="invisible flex min-h-[150px] flex-col gap-5">
              <p className="m-0 text-xl font-medium leading-[1.35] tracking-[-.025em] md:text-[26px]">{current.quote}</p>
              <p className="m-0 text-sm font-medium text-muted-foreground">{current.author}</p>
            </div>
            <div
              key={displayIndex}
              className={cn("absolute inset-x-0 top-0 flex flex-col gap-5 will-change-[transform,opacity]", exiting && "scroll-reel-exit")}
            >
              <p className="m-0 text-xl font-medium leading-[1.35] tracking-[-.025em] md:text-[26px]">
                <Chars text={current.quote} startIndex={0} staggerMs={charStaggerMs} />
              </p>
              <p className="m-0 text-sm font-medium text-muted-foreground">
                <Chars text={current.author} startIndex={current.quote.length + 6} staggerMs={charStaggerMs} />
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center gap-2">
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
      className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-foreground/15 bg-transparent p-0 text-foreground transition-[opacity,transform] duration-200 hover:enabled:scale-[1.06] active:enabled:scale-[.96] disabled:cursor-default disabled:opacity-35"
    >
      <svg className="h-4 w-4 opacity-70" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={previous ? "M7.5 2.5 3.5 6l4 3.5" : "m4.5 2.5 4 3.5-4 3.5"} />
      </svg>
    </button>
  );
}
