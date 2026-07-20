"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { target: 300, suffix: "+", label: "Доволни булки" },
  { target: 15, suffix: "+", label: "Години опит" },
  { target: 98, suffix: "%", label: "Препоръчват ни" },
] as const;

export function AnimatedStats() {
  const rootRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const frameRef = useRef<number | null>(null);
  const [values, setValues] = useState(() => stats.map(() => 0));

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || hasAnimated.current) return;
      hasAnimated.current = true;
      observer.disconnect();

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setValues(stats.map(({ target }) => target));
        return;
      }

      const startedAt = performance.now();
      const duration = 1200;
      const animate = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValues(stats.map(({ target }) => Math.round(target * eased)));
        if (progress < 1) frameRef.current = requestAnimationFrame(animate);
      };

      frameRef.current = requestAnimationFrame(animate);
    }, { threshold: 0.35 });

    observer.observe(root);
    return () => {
      observer.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div ref={rootRef} className="storefront-about__stats">
      {stats.map(({ target, suffix, label }, index) => (
        <div key={label} aria-label={`${target}${suffix} ${label}`}>
          <strong aria-hidden="true">{values[index]}{suffix}</strong>
          <span aria-hidden="true">{label}</span>
        </div>
      ))}
    </div>
  );
}
