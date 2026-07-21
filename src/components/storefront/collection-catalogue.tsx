"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Grid2X2, SlidersHorizontal, Square, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BridalSilhouette, StorefrontCollectionProduct } from "@/lib/storefront-collections";

type GridView = "standard" | "large";
type SilhouetteFilter = BridalSilhouette | "all";
const PRODUCTS_PER_PAGE = 4;

const SILHOUETTES: { value: SilhouetteFilter; label: string }[] = [
  { value: "all", label: "Всички" },
  { value: "a-line", label: "А-линия" },
  { value: "mermaid", label: "Рибка" },
  { value: "princess", label: "Принцеса" },
  { value: "straight", label: "Права" },
];

function SilhouetteIcon({ type }: { type: SilhouetteFilter }) {
  if (type === "all") {
    return (
      <svg viewBox="0 0 56 64" aria-hidden="true">
        <g transform="translate(1 11) scale(.62)">
          <circle cx="16" cy="5" r="3" />
          <path d="M12 10h8l3 11 8 26H1l8-26 3-11Z" />
        </g>
        <g transform="translate(25 8) scale(.62)">
          <circle cx="16" cy="5" r="3" />
          <path d="M12 10h8l2 13 4 24H6l4-24 2-13Z" />
        </g>
      </svg>
    );
  }

  const skirtPath = {
    "a-line": "M20 23h8l13 32H7l13-32Z",
    mermaid: "M20 23h8l3 19 10 13H7l10-13 3-19Z",
    princess: "M19 23h10l18 32H1l18-32Z",
    straight: "M20 23h8l4 32H16l4-32Z",
  }[type];

  return (
    <svg viewBox="0 0 48 64" aria-hidden="true">
      <circle cx="24" cy="7" r="4" />
      <path d="M18 14h12l-2 9h-8l-2-9Z" />
      <path d={skirtPath} />
    </svg>
  );
}

export function CollectionCatalogue({
  collectionSlug,
  products,
}: {
  collectionSlug: string;
  products: StorefrontCollectionProduct[];
}) {
  const [gridView, setGridView] = useState<GridView>("standard");
  const [silhouette, setSilhouette] = useState<SilhouetteFilter>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const filterDialogRef = useRef<HTMLDialogElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const hasSilhouetteFilter = collectionSlug === "bulchinski-rokli";

  const filteredProducts = useMemo(() => {
    return silhouette === "all" || !hasSilhouetteFilter
      ? products
      : products.filter((product) => product.silhouette === silhouette);
  }, [hasSilhouetteFilter, products, silhouette]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < filteredProducts.length;

  useEffect(() => {
    const dialog = filterDialogRef.current;
    if (!dialog) return;

    if (isFilterOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isFilterOpen && dialog.open) {
      dialog.close();
    }
  }, [isFilterOpen]);

  useEffect(() => {
    if (!isFilterOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFilterOpen]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMoreProducts) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setVisibleCount((currentCount) =>
          Math.min(currentCount + PRODUCTS_PER_PAGE, filteredProducts.length),
        );
        observer.disconnect();
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [filteredProducts.length, hasMoreProducts, visibleCount]);

  return (
    <section className="storefront-collection-catalogue" aria-label="Модели в колекцията">
      <div className="storefront-collection-toolbar">
        {hasSilhouetteFilter ? (
          <div className="storefront-collection-filter">
            <button
              ref={filterTriggerRef}
              className="storefront-collection-filter__trigger"
              type="button"
              aria-haspopup="dialog"
              aria-expanded={isFilterOpen}
              onClick={() => setIsFilterOpen(true)}
            >
              <SlidersHorizontal aria-hidden="true" />
              Филтри
            </button>

            {silhouette !== "all" ? (
              <button
                className="storefront-collection-filter__reset"
                type="button"
                onClick={() => {
                  setSilhouette("all");
                  setVisibleCount(PRODUCTS_PER_PAGE);
                }}
              >
                <span>
                  <X aria-hidden="true" />
                  Изчисти
                </span>
              </button>
            ) : null}

            <dialog
              ref={filterDialogRef}
              className="storefront-collection-filter__dialog"
              aria-labelledby="collection-filter-title"
              onKeyDown={(event) => {
                if (event.key !== "Escape") return;
                event.preventDefault();
                event.currentTarget.close();
              }}
              onClose={() => {
                setIsFilterOpen(false);
                filterTriggerRef.current?.focus();
              }}
              onClick={(event) => {
                const bounds = event.currentTarget.getBoundingClientRect();
                const isInside =
                  event.clientX >= bounds.left &&
                  event.clientX <= bounds.right &&
                  event.clientY >= bounds.top &&
                  event.clientY <= bounds.bottom;

                if (!isInside) event.currentTarget.close();
              }}
            >
              <div className="storefront-collection-filter__surface">
                <header className="storefront-collection-filter__header">
                  <h2 id="collection-filter-title">Избери силует</h2>
                  <button
                    className="storefront-collection-filter__close"
                    type="button"
                    aria-label="Затвори филтрите"
                    onClick={() => filterDialogRef.current?.close()}
                  >
                    <X aria-hidden="true" />
                  </button>
                </header>

                <fieldset className="storefront-silhouette-filter">
                  <legend className="sr-only">Силует</legend>
                  <div className="storefront-silhouette-filter__options" role="radiogroup" aria-label="Филтър по силует">
                    {SILHOUETTES.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={silhouette === option.value}
                        onClick={() => {
                          setSilhouette(option.value);
                          setVisibleCount(PRODUCTS_PER_PAGE);
                          filterDialogRef.current?.close();
                        }}
                      >
                        <SilhouetteIcon type={option.value} />
                        <span>{option.label}</span>
                        <Check className="storefront-silhouette-filter__check" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            </dialog>
          </div>
        ) : null}

        <div className="storefront-collection-view" aria-label="Размер на изображенията">
          <button
            type="button"
            aria-label="Стандартен изглед"
            aria-pressed={gridView === "standard"}
            onClick={() => setGridView("standard")}
          >
            <Grid2X2 aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Големи изображения"
            aria-pressed={gridView === "large"}
            onClick={() => setGridView("large")}
          >
            <Square aria-hidden="true" />
          </button>
        </div>

        <span className="sr-only" aria-live="polite">{filteredProducts.length} модела</span>
      </div>

      <div className={`storefront-collection-grid storefront-collection-grid--${gridView}`}>
        {visibleProducts.map((product) => (
          <Link
            href={`/${collectionSlug}/${product.slug}`}
            className="storefront-collection-card-link"
            key={product.slug}
          >
            <article className="storefront-collection-card">
              <div className="storefront-collection-card__media">
                <Image
                  src={product.image}
                  alt={product.alt}
                  fill
                  sizes={gridView === "large" ? "(max-width: 680px) 100vw, 50vw" : "(max-width: 680px) 50vw, (max-width: 1100px) 33vw, 25vw"}
                />
                <div className="storefront-collection-card__veil" aria-hidden="true" />
                <span className="storefront-collection-card__action" aria-hidden="true">
                  Разгледай
                </span>
              </div>
              <h3>{product.name}</h3>
            </article>
          </Link>
        ))}
      </div>

      {visibleProducts.length === 0 ? (
        <p className="storefront-collection-empty" role="status">Няма модели с този силует.</p>
      ) : null}

      {hasMoreProducts ? <div ref={loadMoreRef} className="storefront-collection-load-more" aria-hidden="true" /> : null}
    </section>
  );
}
