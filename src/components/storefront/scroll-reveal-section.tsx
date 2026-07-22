"use client";

import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

type ScrollRevealSectionProps = PropsWithChildren<{
  className: string;
  labelledBy: string;
}>;

export function ScrollRevealSection({ children, className, labelledBy }: ScrollRevealSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12%", threshold: 0.12 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className={`${className}${isVisible || prefersReducedMotion ? " is-visible" : ""}`}
      aria-labelledby={labelledBy}
    >
      {children}
    </section>
  );
}
