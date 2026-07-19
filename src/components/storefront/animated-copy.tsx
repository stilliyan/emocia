"use client";

import * as React from "react";

type RevealStyle = React.CSSProperties & { "--reveal-index": number };

function useRevealOnView<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

export function AnimatedHeroTitle({
  id,
  text,
  desktopBreakBeforeIndices = [],
}: {
  id: string;
  text: string;
  desktopBreakBeforeIndices?: number[];
}) {
  const words = text.split(" ");

  return (
    <h1 id={id} className="storefront-hero-title" aria-label={text}>
      {words.map((word, index) => (
        <React.Fragment key={`${word}-${index}`}>
          {desktopBreakBeforeIndices.includes(index) ? (
            <br className="storefront-hero-title__desktop-break" aria-hidden="true" />
          ) : null}
          <span
            aria-hidden="true"
            className="storefront-hero-title__word"
            style={{ "--reveal-index": index } as RevealStyle}
          >
            {word}
          </span>
          {index < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </h1>
  );
}

export function AnimatedManifestoQuote({ lines }: { lines: string[] }) {
  const { ref, visible } = useRevealOnView<HTMLQuoteElement>();
  const accessibleText = lines.join(" ");
  const indexedLines = lines.map((line, lineIndex) => {
    const lineOffset = lines
      .slice(0, lineIndex)
      .reduce((total, previousLine) => total + previousLine.length + 1, 0);
    const words = line.split(" ");

    return {
      line,
      words: words.map((word, wordIndex) => ({
        word,
        startIndex:
          lineOffset +
          words.slice(0, wordIndex).reduce((total, previousWord) => total + previousWord.length + 1, 0),
      })),
    };
  });

  return (
    <blockquote
      ref={ref}
      className={visible ? "storefront-manifesto-quote is-visible" : "storefront-manifesto-quote"}
      aria-label={accessibleText}
    >
      {indexedLines.map(({ line, words }, lineIndex) => (
        <React.Fragment key={line}>
          {words.map(({ word, startIndex }, wordIndex) => (
            <React.Fragment key={`${word}-${wordIndex}`}>
              <span className="storefront-manifesto-quote__word" aria-hidden="true">
                {Array.from(word).map((character, index) => (
                  <span
                    className="storefront-manifesto-quote__char"
                    style={{ "--reveal-index": startIndex + index } as RevealStyle}
                    key={`${character}-${index}`}
                  >
                    {character}
                  </span>
                ))}
              </span>
              {wordIndex < words.length - 1 ? " " : null}
            </React.Fragment>
          ))}
          {lineIndex < lines.length - 1 ? <br aria-hidden="true" /> : null}
        </React.Fragment>
      ))}
    </blockquote>
  );
}
