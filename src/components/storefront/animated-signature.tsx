"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedSignature() {
  const signatureRef = useRef<HTMLParagraphElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const signature = signatureRef.current;

    if (!signature) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setIsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.45 },
    );

    observer.observe(signature);

    return () => observer.disconnect();
  }, []);

  return (
    <p
      ref={signatureRef}
      className={`storefront-signature${isVisible ? " is-visible" : ""}`}
    >
      <span className="storefront-signature__text">Veselina M.</span>
      <span className="storefront-signature__pen-tip" aria-hidden="true" />
    </p>
  );
}
