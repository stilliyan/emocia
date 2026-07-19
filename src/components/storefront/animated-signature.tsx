"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const signature = "Veselina M.";

type SignatureStyle = CSSProperties & {
  "--signature-index": number;
};

export function AnimatedSignature() {
  const signatureRef = useRef<HTMLParagraphElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [viewBox, setViewBox] = useState("-24 -24 640 180");

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

  useEffect(() => {
    const fitSignature = async () => {
      await document.fonts.load('96px "Modelista Signature"');

      const bounds = textRef.current?.getBBox();

      if (!bounds) return;

      const padding = 18;
      setViewBox(
        `${bounds.x - padding} ${bounds.y - padding} ${bounds.width + padding * 2} ${bounds.height + padding * 2}`,
      );
    };

    void fitSignature();
  }, []);

  return (
    <p
      ref={signatureRef}
      className={`storefront-signature${isVisible ? " is-visible" : ""}`}
    >
      <svg
        className="storefront-signature__svg"
        viewBox={viewBox}
        role="img"
        aria-label="Подпис: Veselina M."
      >
        <text
          ref={textRef}
          className="storefront-signature__fill"
          x="0"
          y="112"
        >
          {signature}
        </text>
        <text
          className="storefront-signature__stroke"
          x="0"
          y="112"
          aria-hidden="true"
        >
          {[...signature].map((character, index) => (
            <tspan
              key={`${character}-${index}`}
              style={{ "--signature-index": index } as SignatureStyle}
            >
              {character}
            </tspan>
          ))}
        </text>
      </svg>
    </p>
  );
}
