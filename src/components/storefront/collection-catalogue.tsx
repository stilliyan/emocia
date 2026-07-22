"use client";

import { Check, Grid2X2, SlidersHorizontal, Square, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  accessoryCategoryLabels,
  formatStorefrontPrice,
  type AccessoryCategory,
  type BridalSilhouette,
  type StorefrontCollectionProduct,
} from "@/lib/storefront-collections";
import { ProductCard } from "./product-card";

type GridView = "standard" | "large";
type SilhouetteFilter = BridalSilhouette | "all";
type AccessoryFilter = AccessoryCategory | "all";
const PRODUCTS_PER_PAGE = 4;

const SILHOUETTES: { value: SilhouetteFilter; label: string }[] = [
  { value: "all", label: "Всички" },
  { value: "a-line", label: "А-линия" },
  { value: "mermaid", label: "Рибка" },
  { value: "princess", label: "Принцеса" },
  { value: "straight", label: "Права" },
];

const ACCESSORY_CATEGORIES: { value: AccessoryFilter; label: string }[] = [
  { value: "all", label: "Всички" },
  ...Object.entries(accessoryCategoryLabels).map(([value, label]) => ({
    value: value as AccessoryCategory,
    label,
  })),
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
  collectionTitle,
  products,
}: {
  collectionSlug: string;
  collectionTitle: string;
  products: StorefrontCollectionProduct[];
}) {
  const [gridView, setGridView] = useState<GridView>("standard");
  const [silhouette, setSilhouette] = useState<SilhouetteFilter>("all");
  const [accessoryCategory, setAccessoryCategory] = useState<AccessoryFilter>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const filterDialogRef = useRef<HTMLDialogElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const hasSilhouetteFilter = products.some((product) => product.silhouette);
  const hasAccessoryFilter = products.some((product) => product.category);
  const hasFilter = hasSilhouetteFilter || hasAccessoryFilter;
  const hasActiveFilter = hasSilhouetteFilter ? silhouette !== "all" : accessoryCategory !== "all";

  const filteredProducts = useMemo(() => {
    if (hasSilhouetteFilter && silhouette !== "all") {
      return products.filter((product) => product.silhouette === silhouette);
    }
    if (hasAccessoryFilter && accessoryCategory !== "all") {
      return products.filter((product) => product.category === accessoryCategory);
    }
    return products;
  }, [accessoryCategory, hasAccessoryFilter, hasSilhouetteFilter, products, silhouette]);

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
        {hasFilter ? (
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

            {hasActiveFilter ? (
              <button
                className="storefront-collection-filter__reset"
                type="button"
                onClick={() => {
                  setSilhouette("all");
                  setAccessoryCategory("all");
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
                  <h2 id="collection-filter-title">
                    {hasAccessoryFilter ? "Избери категория" : "Избери силует"}
                  </h2>
                  <button
                    className="storefront-collection-filter__close"
                    type="button"
                    aria-label="Затвори филтрите"
                    onClick={() => filterDialogRef.current?.close()}
                  >
                    <X aria-hidden="true" />
                  </button>
                </header>

                <fieldset
                  className={`storefront-silhouette-filter${hasAccessoryFilter ? " storefront-accessory-filter" : ""}`}
                >
                  <legend className="sr-only">
                    {hasAccessoryFilter ? "Категория" : "Силует"}
                  </legend>
                  <div
                    className="storefront-silhouette-filter__options"
                    role="radiogroup"
                    aria-label={hasAccessoryFilter ? "Филтър по категория" : "Филтър по силует"}
                  >
                    {(hasAccessoryFilter ? ACCESSORY_CATEGORIES : SILHOUETTES).map((option, index) => {
                      const checked = hasAccessoryFilter
                        ? accessoryCategory === option.value
                        : silhouette === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="radio"
                          aria-checked={checked}
                          onClick={() => {
                            if (hasAccessoryFilter) {
                              setAccessoryCategory(option.value as AccessoryFilter);
                            } else {
                              setSilhouette(option.value as SilhouetteFilter);
                            }
                            setVisibleCount(PRODUCTS_PER_PAGE);
                            filterDialogRef.current?.close();
                          }}
                        >
                          {hasAccessoryFilter ? (
                            <span className="storefront-accessory-filter__index" aria-hidden="true">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                          ) : (
                            <SilhouetteIcon type={option.value as SilhouetteFilter} />
                          )}
                          <span>{option.label}</span>
                          <Check className="storefront-silhouette-filter__check" aria-hidden="true" />
                        </button>
                      );
                    })}
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
          <ProductCard
            key={product.slug}
            href={`/${collectionSlug}/${product.slug}`}
            image={product.image}
            alt={product.alt}
            eyebrow={collectionTitle}
            name={product.name}
            price={formatStorefrontPrice(product.price)}
            showCategory={false}
            sizes={gridView === "large" ? "(max-width: 680px) 100vw, 50vw" : "(max-width: 680px) 50vw, (max-width: 1100px) 33vw, 25vw"}
          />
        ))}
      </div>

      {visibleProducts.length === 0 ? (
        <p className="storefront-collection-empty" role="status">
          {hasAccessoryFilter ? "Скоро ще добавим артикули в тази категория." : "Няма модели с този силует."}
        </p>
      ) : null}

      {hasMoreProducts ? <div ref={loadMoreRef} className="storefront-collection-load-more" aria-hidden="true" /> : null}
    </section>
  );
}
